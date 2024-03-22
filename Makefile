install:
    node -v && npm install
build:
    npm run build && go build -o server-built
run:
    go run main.go
