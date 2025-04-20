# 가벼운 Alpine 베이스 이미지 사용
FROM node:20-alpine

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치!
RUN npm ci --only=production

# 나머지 코드 복사 (주의: .dockerignore 설정 필수!)
COPY . .

# 애플리케이션 실행
CMD ["npm", "start"]