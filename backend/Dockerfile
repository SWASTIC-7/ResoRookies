# Build the application from source
FROM golang:1.22 AS build-stage

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd
COPY ./pkg ./pkg

RUN CGO_ENABLED=0 GOOS=linux go build -o /program ./cmd

# Run the tests in the container
FROM build-stage AS run-test-stage
RUN go test -v ./pkg/helper

# Deploy the application binary into a lean image
FROM alpine:latest AS build-release-stage

WORKDIR /app

COPY ./songs ./songs

COPY --from=build-stage /program ./program

EXPOSE 3000

RUN adduser -D nonroot
USER nonroot

CMD ["./program"]
