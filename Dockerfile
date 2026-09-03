FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 설치를 위해 파일 복사
COPY package*.json ./

# 의존성 설치 (버전 충돌 방지를 위해 --legacy-peer-deps 권장)
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 외부에서 전달받을 빌드 변수 선언
ARG NEXT_PUBLIC_KAKAO_APP_KEY

# 컨테이너 내부의 환경 변수로 설정 (Next.js 빌드 시 사용됨)
ENV NEXT_PUBLIC_KAKAO_APP_KEY=$NEXT_PUBLIC_KAKAO_APP_KEY

# Next.js 프로젝트 빌드
RUN npm run build


# 2. 실행 환경 (실행 환경도 Node 20으로 업그레이드)
FROM node:20-alpine AS runner

WORKDIR /app

# 빌드 결과물만 복사 (이미지 용량 최적화)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# 포트 설정
EXPOSE 3000

# 서버 시작
CMD ["npm", "start"]