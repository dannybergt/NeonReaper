.PHONY: setup dev build preview test typecheck lint clean docker-build docker-run

setup:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

test:
	npm run test

typecheck:
	npm run typecheck

lint:
	npm run lint

clean:
	rm -rf dist node_modules .vite coverage

docker-build:
	docker build -t neonreaper:dev .

docker-run:
	docker run --rm -p 8080:80 --name neonreaper-dev neonreaper:dev
