# DNS Server Dockerfile (Go)
FROM golang:1.19-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o dns-server .

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

COPY --from=builder /app/dns-server .
COPY --from=builder /app/config ./config

EXPOSE 53/udp 853/tcp 443/tcp 8080/tcp

CMD ["./dns-server"]