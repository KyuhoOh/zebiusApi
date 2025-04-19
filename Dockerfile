# Node.js 공식 이미지 사용
FROM node:20

# 애플리케이션 디렉토리 생성
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 애플리케이션 코드 복사
COPY . .

# 애플리케이션 실행
CMD ["npm", "start"]
