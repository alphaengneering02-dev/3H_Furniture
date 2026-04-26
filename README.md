

# CMYK-Team

3H_Furniture

휴먼교육센터 수원 3차 프로젝트

🤝 팀 규칙 (Team Rules)

1.기본 태도

  팀원 간 상호 존중과 예의를 기본으로 한다  
  감정이 상했을 때 그 자리에서 대화로 해결한다 (짜증 X, 서운한 점 말하기 O)  
  의견 충돌로 생긴 감정을 끝까지 끌고 가지 않는다  
  인신공격성 발언은 절대 금지

2.지식의 저주를 조심하세요 💡

"특정 지식을 깨달은 사람은, 본인도 과거에 몰랐다는 걸 잊게 됩니다"


"왜 이거밖에 못해?", "왜 이해 못해?" 같은 말은 조장 포함 누구도 하지 않는다
모르는 건 부끄러운 게 아닙니다, 애매한 부분은 반드시 질문하기


3.갈등 해결 프로세스 🔥

먼저 당사자끼리 대화 시도
해결 어려울 경우 조장에게 알리기
조장 선에서 최대한 해결 (선생님께 가지 않도록)


4.개발 규칙 💻

변수 네이밍 규칙<br/>
예시)TestFile(camelCase)

패키지 네이밍 규칙<br/>
항상 팀명/프로젝트명 으로 만듭니다<br/>
예시)cmyk/3H/domain/product

디버깅 규칙
디버깅은 혼자 1시간 이상 잡지 말기 → 초과 시 조장에게 도움 요청

테스트 규칙 <br/>
기능 구현 후 반드시 테스트 파일에서 유효성 검사 해주세요.
테스트 파일에서도 다른 객체 사용하지 않게 의존성 주입 필수!!  <br/>
ex) <br/>
```
@BeforeEach <br/>
    public void beforeEach(){  <br/>
        memberRepository = new MemoryMemberRepository();  <br/>
        memberService = new MemberService(memberRepository);  <br/>
    }  <br/>
```
테스트 후 반드시 데이터가 남아서 이전 테스트와 충돌나지 않게 해주세요  <br/>
ex)  <br/>
```
@AfterEach  <br/>
    public void afterEach(){  <br/>
        memberRepository.clearStore();  <br/>
    } <br/>
```
주석 규칙 <br/>
메소드 위에는  <br/>
/**  <br/>
*method  <br/>
*/  <br/>
으로통일

그외 주석 // 으로 통일 

기능 구현은 스스로 최대한 도전
기한 내 어려울 것 같으면 Google / AI 적극 활용 (외우려 하지 말기!)<br/>

AI는 자유롭게 사용해도 되나 맹신 금지 (본인의 판단을 믿기)


## 📝 커밋 컨벤션
| 타입 | 설명 |
|------|------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| style | 코드 스타일 수정 |
| refactor | 코드 리팩토링 |
| test | 테스트 코드 추가 |
| chore | 빌드 업무 수정 |

\* 프로젝트 구조는 예시입니다. 프로젝트에 맞게 변경 있을 수 있습니다.



## 📂 프로젝트 구조

```bash
threeh/src/main/java/com/cmyk
/threeh/

├── 📦 domain/
├── 🎮 controller/
├── ⚙️ service/
├── 💾 repository/
└── 📑 entity/
└── 🌍 global/
    ├── ❌ error/
    └── 🛠️ utils/
    └── 🔧 config/
    └── common/

이것들은 모두 초대후 제가 알려드립니다

5.문서 & 협업 도구 📁
회의록 / 보고Notion (모든 수정사항 및 작업 사항은 노션에 올리게됩니다)
코드 관리 GitHub/GitDeskTop 
 :깃허브에 저희 코드가 모두 공유되고, Readme파일에 이 사항들이 모두 올라가게되니
기억이 안나면 깃허브를 보시면 됩니다
구두 보고는 자유롭게

--노션에 파일로도 업로드 되고, 네이트온으로도 공유하겠습니다.
6.DB
예정으로는 Oracle Cloud BD를쓸 예정입니다.
필요시 Oralce SQL Developer 사용해서 쉬운 DB사용을 할 생각입니다.
설계는 상향식 방식으로 할 예정입니다(Bottom-up)

7.프로젝트 주제가 정해진 후
API명세를 작성할 예정입니다(각각 자기페이지 필요한 api명세 작성)
하는이유:
DB의 칼럼명과 백엔드 및 프론트엔드 api 요청시 변수명의 혼동이 없도록 하기 위함입니다.
일관성유지

!! 코드 리뷰 가이드
코드 스타일과 일관성 체크
불필요한 코드/주석 제거
예외 처리 적절성 확인
성능 및 보안 이슈 검토

복잡하거나 긴 내용은 반드시 문서화

8.기술 스택
## 🛠 Tech Stack

- 🌐 React
- 🎨 CSS3 & BootStrap
- ☕ Java
- 🍃 Spring Boot(vsCode)
- 🔒 Spring Security & JWT
- 🗄️ Spring Data JPA
- 🔶 Oracle Cloud Autonomous DB

9.Image는 java/com/cmyk/threeh/static/images
밑에 각 해당하는 폴더에 넣으시면됩니다

공용 함수 폴더 예시
├── common
│   ├── response (공통 응답 양식)
│   └── exception (공통 에러 처리)
├── config
│  ├── AppConfig (애플리케이션 전역 설정)
    ├── SecurityConfig (보안/인증 관련 설정)
    ├── DatabaseConfig (DB 연결 설정)
    ├── PathConfig (파일/디렉토리 경로 설정)
    └── PropertyConfig (yml / properties 매핑)
└── util
    ├── DateUtil (날짜 가공)
    └── SearchUtil (검색어 정제)

10. 프로젝트 필독사항

1. 프로젝트 최상위 폴더 이름 공백없이 영어로 해주세요

2.APPLICATION-LOCAL.PROPERTIS.EXAMPLE 안에 내용을 읽고
APPLICATION-LOCAL.PROPERTIS를 만들어서 내용대로 설정해주세요
APPLICATION-LOCAL.PROPERTIS를 gitignore에 src/main/resources/application-local.properties
이걸 맨 아래에 추가해주셔야 commit이 안됩니다(해당 파일을 로컬설정이라 git에 올리면 안됩니다.)

3.local에서 실행시 C:\본인프로젝트폴더이름\3H_\springreact\src\main\frontend> yarn start

http://localhost:3000/ 경로

또는 JAVA RUN 이후
HTTP://localhost:8080/도메인 경로



배포시D:\CMKYTeamProject\3H_Furniture\threeh에서
프로젝트 경로 C드라이브 또는 D드라이브 는 자신의 폴더에 맞게
gradlew build 

-> cd build
-> cd libs

->프로젝트 이름 - 0.0.1-snapshot.jar 이름 복사

 D:\CMKYTeamProject\3H_Furniture\threehbuild\libs> java -jar threeh-0.0.1-SNAPSHOT.jar

브라우져에서 접속: http://localhost:8080

빌드에러시
build폴더 삭제 명령 : 
C:\VSCode\react\springreact> gradlew clean

삭제후 build : 
C:\VSCode\react\springreact> gradlew clean build

🎯 조장의 한마디

"저는 프로젝트의 퀄리티보다 여러분의 성장을 더 기대합니다.
자유롭고 행복한 프로젝트가 됐으면 좋겠습니다." 🙌
