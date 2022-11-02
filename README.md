# **:computer: Stageus backend 과정**
## **과정 목표 :key:**
1. Node.js 기반, 현업에서 이용할 수 있는 체계적인 웹서버의 구축과 운용
2. 완벽한 예외처리 경험


## **3대 원칙:scroll:**
1. 작업에 대한 근거를 명확하게 정한 뒤, 최적화된 선택을 하는 원칙
2. 문제를 해결하는 행동을 지양하고, 원인을 파악해 제거하는 원칙
3. 항상 협업을 생각하고, 유지보수와 가독성을 고려하여 개발하는 원칙


## **페이지 도메인:pushpin:**
- https://backend.민경찬.com


## **폴더 구조 :file_folder:**
```bash
├── config
├── module
├── public
│   ├── html
│   ├── css
│   └── js
├── router
└── server.js
```


<br>
<br>
<br>

# **배운 내용**

## **1 주차**
- **백엔드 개발자의 자세**
    1. 깊게 아는 것이 중요 
    2. 예외처리의 중심부 역할을 제대로 해내야 함


<br/>


## **2 주차**
- **Node.js와 npm**
    1. Node.js : javascript runtime
    2. npm : package관리 
- **과제 :books:**
    1. 내용 : express를 사용하여 로그인, 회원가입, 게시글, 댓글 기능 구현 
    2. mariadb를 사용
    3. RESTful하게 api 설계

## **3 주차**
- **API 예외처리**
    1. NULL, undefined 확인
    2. data 양식 확인
    3. try-catch 사용
- **DB 종류**
    1. 관계형 데이터베이스 (RDB)
        - 엄격한 스키마 존재
        - SQL문을 기준으로 동작
    2. 비관계형 데이터베이스
        - 스키마가 없음
        - 데이터 타입에 구애받지 않음
        - 구축이 용이하고 확장성이 좋음
        - 삽입은 빠르나 수정, 삭제, 탐색은 느림
        - 사용 예시) 로깅 작업
- **PostgreSQL**
    1. 특징
        - 무료
        - 가볍지만 많은 양의 데이터를 다뤄도 크게 문제가 없음
        - 독특한 자료형 제공 (Array, json) // 공식 문서 기준 권장하지 않는다 함
    2. 구조
        - 데이터베이스 - 스키마 - 테이블 
    3. 명령어
        - psql -d [database] : (리눅스 명령어) 해당 데이터베이스로 접속
        - \c [database] : 해당 데이터베이스로 이동
        - \dn : 스키마 목록 출력
        - \du : 유저 목록 출력
        - \dt [schema].[table] 
        - \d+ [table] : 해당 테이블의 구조를 보여줌 
- **과제** :books:
    1. 게시판 CRUD기능을 모두 PostgreSQL로 변경

<br/>

## **4 주차**
- **MongoDB**
    1. 장점
        - 모든 데이터를 json으로 삽입
        - 대충 넣으면 대충 저장해줘서 편함
    2. 단점
        - 수정, 삭제가 불편함
        - 데이터 무결성을 보장하지 않음

- **SSL**
    1. 암호화 방식
        - 비대칭키 방식을 사용
    2. HTTPS
        - http + SSL

<br/>

## **5 주차**
- **Process**
    - 정의 : 운영체제에서 구동되고 있는 프로그램의 단위
    - Multi Process 
        - 동시에 여러 개의 Process를 구동할 수 있게 하는 기술
    - Load Balancing
        - 한 개의 프로그램을 여러개의 process로 쪼개서 사용하는 기술
- **Linux**
    - 명령어
        1. df -h : 스토리지를 볼 수 있음
        2. free -h : 메모리 사용량을 볼 수 있음
        3. lsblk : 파일 시스템을 볼 수 있음

- **EC2**
    - 정의 : ec2 aws에서 제공하는 클라우드 호스팅 서비스
    - 사용할 것 들
        1. S3
            - HDD 기반의 외장 스토리지 (이미지 파일 저장할 때 사용하면 유용)
        2. EBS
            - SSD 기반의 내장 스토리지
        3. RDS  
            - 독립적으로 동작할 수 있는 외장 데이터베이스
- **과제 :books:**
    - 0~3개까지의 이미지를 게시글과 함께 저장하는 기능
        1. 저장할 때는 S3에 저장하고 저장 경로는 DB에 저장
    - ebs를 기존 인스턴스에 추가로 달기
    - 추가로 단 ebs를 뽑아서 다른 ec2에 연결



<br/>
<br/>

# :wave: 떠나며
내 주변에는 개발 이야기를 할 사람이 없다. 새로운 기능을 발견한다거나, 공감가는 불편함을 공유할 사람이 없었다. 하지만 **stageus**에서 사람들과 소통하며 너무 즐거웠다. 개발 관련 이야기도 하고 즐거웠다. 

과제 내용도 좋았다. 요즘 학원이나 부트캠프에 대한 시선이 많이 안좋아졌다. 하지만 방향성을 모르면 노력을 할 수 없다. **stageus**에서 공부할 때 마다 느끼는 점이 있다. 내가 무엇을 공부해야하고 무엇을 모르는지 알기 너무 좋다. 그런 점에서 항상 만족스럽게 과제를 하고있다. 

과제에 대해서도 하고 싶은 말이 참 많다. 과제를 해결하면서 내가 얻어가는 지식이 정말 많다. 과제 자체가 내가 얻어가는 지식이 많도록 설계되어 있는 느낌이다. 심지어 과제를 해결하고 나면 팀장님이 내게 무엇을 알려주고 싶으셨는지 느껴진다. 매 과제가 새로운 도전이지만 충분히 해결할만 했고 너무나도 도움되는 내용이였다. 
