from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import os
import logging
from typing import List, Dict, Optional
import asyncio
import httpx
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DNS Firewall AI Classifier",
    description="AI-powered domain classification service for DNS firewall",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        password=os.getenv('REDIS_PASSWORD'),
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Connected to Redis")
except Exception as e:
    logger.error(f"Redis connection failed: {e}")
    redis_client = None

# Pydantic models
class DomainClassificationRequest(BaseModel):
    domain: str
    client_ip: Optional[str] = None
    query_type: Optional[str] = "A"

class DomainClassificationResponse(BaseModel):
    domain: str
    threat_level: str
    confidence: float
    features: Dict
    processing_time: float
    timestamp: str

class BatchClassificationRequest(BaseModel):
    domains: List[str]

# Mock AI Model Class
class DomainClassifier:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.is_trained = False
        self.load_or_train_model()
    
    def extract_features(self, domain: str) -> Dict:
        """Extract features from domain name"""
        features = {
            'domain_length': len(domain),
            'subdomain_count': domain.count('.'),
            'has_numbers': bool(re.search(r'\d', domain)),
            'has_hyphens': '-' in domain,
            'entropy': self.calculate_entropy(domain),
            'vowel_ratio': self.calculate_vowel_ratio(domain),
            'consonant_ratio': 1 - self.calculate_vowel_ratio(domain),
            'suspicious_tld': self.check_suspicious_tld(domain),
            'suspicious_keywords': self.check_suspicious_keywords(domain),
            'domain_age_estimate': self.estimate_domain_age(domain)
        }
        return features
    
    def calculate_entropy(self, domain: str) -> float:
        """Calculate Shannon entropy of domain"""
        if not domain:
            return 0
        
        # Count character frequencies
        char_counts = {}
        for char in domain.lower():
            char_counts[char] = char_counts.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0
        domain_length = len(domain)
        for count in char_counts.values():
            probability = count / domain_length
            if probability > 0:
                entropy -= probability * np.log2(probability)
        
        return entropy
    
    def calculate_vowel_ratio(self, domain: str) -> float:
        """Calculate ratio of vowels in domain"""
        vowels = 'aeiou'
        vowel_count = sum(1 for char in domain.lower() if char in vowels)
        return vowel_count / len(domain) if domain else 0
    
    def check_suspicious_tld(self, domain: str) -> bool:
        """Check if domain has suspicious TLD"""
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download', '.zip']
        return any(domain.endswith(tld) for tld in suspicious_tlds)
    
    def check_suspicious_keywords(self, domain: str) -> bool:
        """Check for suspicious keywords in domain"""
        suspicious_keywords = [
            'malware', 'phishing', 'scam', 'fake', 'virus', 'trojan',
            'botnet', 'spam', 'hack', 'crack', 'warez', 'torrent',
            'banking', 'paypal', 'amazon', 'microsoft', 'google',
            'facebook', 'twitter', 'instagram', 'secure', 'verify'
        ]
        domain_lower = domain.lower()
        return any(keyword in domain_lower for keyword in suspicious_keywords)
    
    def estimate_domain_age(self, domain: str) -> float:
        """Estimate domain age based on patterns (mock implementation)"""
        # Newer domains often have more complex patterns
        if len(domain) > 20 or domain.count('-') > 2:
            return 0.3  # Likely newer
        elif any(char.isdigit() for char in domain):
            return 0.6  # Mixed age
        else:
            return 0.9  # Likely older
    
    def load_or_train_model(self):
        """Load existing model or train a new one"""
        model_path = os.getenv('MODEL_PATH', '/models/domain_classifier.pkl')
        
        try:
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.model = model_data['model']
                    self.vectorizer = model_data['vectorizer']
                    self.is_trained = True
                    logger.info("Loaded pre-trained model")
            else:
                self.train_model()
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.train_model()
    
    def train_model(self):
        """Train a new model with mock data"""
        logger.info("Training new model...")
        
        # Mock training data
        safe_domains = [
            'google.com', 'facebook.com', 'amazon.com', 'microsoft.com',
            'apple.com', 'github.com', 'stackoverflow.com', 'wikipedia.org',
            'youtube.com', 'twitter.com', 'linkedin.com', 'reddit.com'
        ]
        
        malicious_domains = [
            'malware-site.com', 'phishing-bank.net', 'fake-paypal.org',
            'virus-download.tk', 'scam-website.ml', 'trojan-host.ga',
            'botnet-c2.click', 'spam-sender.download', 'hack-tools.zip'
        ]
        
        # Create training dataset
        domains = safe_domains + malicious_domains
        labels = [0] * len(safe_domains) + [1] * len(malicious_domains)
        
        # Extract features
        feature_vectors = []
        for domain in domains:
            features = self.extract_features(domain)
            feature_vectors.append(list(features.values()))
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(feature_vectors, labels)
        
        # Create vectorizer for domain names
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 3))
        self.vectorizer.fit(domains)
        
        self.is_trained = True
        logger.info("Model training completed")
    
    def classify(self, domain: str) -> Dict:
        """Classify a domain"""
        if not self.is_trained:
            raise ValueError("Model not trained")
        
        start_time = datetime.now()
        
        # Extract features
        features = self.extract_features(domain)
        feature_vector = [list(features.values())]
        
        # Get prediction
        prediction = self.model.predict(feature_vector)[0]
        confidence = self.model.predict_proba(feature_vector)[0].max()
        
        # Determine threat level
        if prediction == 0:
            threat_level = 'safe'
        elif confidence > 0.8:
            threat_level = 'malicious'
        else:
            threat_level = 'suspicious'
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            'domain': domain,
            'threat_level': threat_level,
            'confidence': float(confidence),
            'features': features,
            'processing_time': processing_time,
            'timestamp': datetime.now().isoformat()
        }

# Initialize classifier
classifier = DomainClassifier()

@app.on_event("startup")
async def startup_event():
    logger.info("AI Classifier service started")

@app.get("/")
async def root():
    return {
        "service": "DNS Firewall AI Classifier",
        "version": "1.0.0",
        "status": "running",
        "model_trained": classifier.is_trained
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_status": "trained" if classifier.is_trained else "not_trained",
        "redis_status": "connected" if redis_client and redis_client.ping() else "disconnected"
    }

@app.post("/classify", response_model=DomainClassificationResponse)
async def classify_domain(request: DomainClassificationRequest):
    """Classify a single domain"""
    try:
        # Check cache first
        cache_key = f"classification:{request.domain}"
        if redis_client:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return DomainClassificationResponse(**json.loads(cached_result))
        
        # Classify domain
        result = classifier.classify(request.domain)
        
        # Cache result
        if redis_client:
            redis_client.setex(cache_key, 3600, json.dumps(result))  # Cache for 1 hour
        
        return DomainClassificationResponse(**result)
    
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify/batch")
async def classify_domains_batch(request: BatchClassificationRequest):
    """Classify multiple domains"""
    try:
        results = []
        
        for domain in request.domains:
            # Check cache first
            cache_key = f"classification:{domain}"
            cached_result = None
            
            if redis_client:
                cached_result = redis_client.get(cache_key)
            
            if cached_result:
                results.append(json.loads(cached_result))
            else:
                result = classifier.classify(domain)
                results.append(result)
                
                # Cache result
                if redis_client:
                    redis_client.setex(cache_key, 3600, json.dumps(result))
        
        return {
            "results": results,
            "total_processed": len(results),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Batch classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get classification statistics"""
    try:
        # Mock statistics
        stats = {
            "total_classifications": np.random.randint(10000, 50000),
            "safe_domains": np.random.randint(8000, 40000),
            "suspicious_domains": np.random.randint(1000, 5000),
            "malicious_domains": np.random.randint(500, 2000),
            "average_processing_time": round(np.random.uniform(0.005, 0.050), 3),
            "model_accuracy": round(np.random.uniform(0.85, 0.95), 3),
            "cache_hit_rate": round(np.random.uniform(0.60, 0.85), 3),
            "last_model_update": "2024-01-15T10:30:00Z"
        }
        
        return stats
    
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
async def retrain_model(background_tasks: BackgroundTasks):
    """Retrain the classification model"""
    try:
        background_tasks.add_task(classifier.train_model)
        return {
            "message": "Model retraining started",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Retrain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)