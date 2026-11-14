/* 목동관 데이터: 강사·사진 — 내용 수정은 이 파일에서 */
const BRANCH='mokdong';   /* 시트에서 이 지점 반만 골라 보여 줌 */
const POPUP_KEY='popup_skip_mokdong';
const PHOTO_DATA={'남매논술팀':'img/teachers/nammae-nonsul.webp',
  '김소진':'img/teachers/kim-sojin.webp','정예진':'img/teachers/jeong-yejin.webp','임한비':'img/teachers/lim-hanbi.webp','윤서은':'img/teachers/yun-seoeun.webp',
  '안호수':'img/teachers/an-hosu.webp','이나경':'img/teachers/lee-nagyeong.webp','박준형':'img/teachers/park-junhyeong.jpg','권세은':'img/teachers/kwon-seeun.webp',
  '김동률':'img/teachers/kim-dongryul.webp','최예빈':'img/teachers/choi-yebin.webp','김경민':'img/teachers/kim-gyeongmin.webp','이승민':'img/teachers/lee-seungmin.webp',
  '정다혜':'img/teachers/jeong-dahye.webp','정지애':'img/teachers/jeong-jiae.jpg','김동완':'img/teachers/kim-dongwan.webp',
  '정아린':'img/teachers/jeong-arin.webp',
  '주윤겸':'img/teachers/ju-yungyeom.webp'
};
/* Subject colors — clearly distinct */
const SC={
  '국어':     {bg:'#FEF9C3',text:'#854D0E',avatar:'#A16207'},
  '수학':     {bg:'#DCFCE7',text:'#166534',avatar:'#15803D'},
  '영어':     {bg:'#FCE7F3',text:'#9D174D',avatar:'#BE185D'},
  '사회':     {bg:'#EDE9FE',text:'#5B21B6',avatar:'#7C3AED'},
  '과학':     {bg:'#E0F2FE',text:'#075985',avatar:'#0369A1'},
  '논술':     {bg:'#E4ECF7',text:'#2F558C',avatar:'#4F75AB'},
  '면접·컨설팅':{bg:'#E4E9F1',text:'#1E293B',avatar:'#334155'},
};

const TEACHERS=[
  {name:'김소진',filters:['국어'],role:null,subjects:['국어'],
   msg:'글을 제대로 읽는 전공자의 눈',tags:['부원장','연세대 국어국문학','국어 전임'],
   career:['메이트학원 부원장','메이트학원 국어과 전임강사','연세대학교 국어국문학과','목동초등학교 · 목동중학교 졸업','이화여자대학교 인문논술 합격','연세대학교 편입논술 합격','2026년 이투스북 연간검토단'],
   subjects_teach:['수능 국어','내신 국어'],target:'고1·2·3 / N수',blogLinks:[{title:'김소진T 강사 소개',url:'https://blog.naver.com/yourmate_gimpo/224362103359'},{title:'[후기] 국어 김소진T 수강후기',url:'https://blog.naver.com/edumate_mokdong/224271700457'},{title:'[합격수기] 한양대 음대 합격생 합격수기',url:'https://blog.naver.com/edumate_mokdong/224182881117'}]},
  {name:'정예진',filters:['국어'],role:null,subjects:['국어'],
   msg:'수능 국어는 정예진',tags:['과외어플 전국 상위 0.2%','대치명인학원'],
   career:['메이트학원 국어과 강사','과외어플 전국 상위 0.2%','現) 대치명인학원 후곡캠퍼스'],
   subjects_teach:['수능 국어','내신 국어'],target:'고1·2·3 / N수',videos:[{title:'2027학년도 9월 평가원 모의고사 해설강의(주요문항)',id:'PA1M5m0x0jI'}],blogLinks:[]},
  {name:'임한비',filters:['국어'],role:null,subjects:['국어'],
   msg:'국어의 단비',tags:['국어 전임'],
   career:['메이트학원 국어과 전임강사'],
   subjects_teach:['수능 국어','내신 국어'],target:'고1·2·3',
   blogLinks:[{title:'임한비T 강사 소개',url:'https://blog.naver.com/edumate_mokdong/224376926987'},{title:'고1/고2 국어 내신 공부 방법',url:'https://blog.naver.com/edumate_mokdong/224379916436'},{title:'고2 화법과언어(문법) 수업 및 관리 안내',url:'https://blog.naver.com/edumate_mokdong/224465053036'}]},
  {name:'김동완',filters:['국어','면접·컨설팅'],role:null,
   subjects:['국어','면접·컨설팅'],
   msg:'너의 마지막 입시 메이트',tags:['원장','연세대 국어국문학','국어학 석사과정'],
   career:['메이트학원 대표원장','연세대학교 국어국문학과 · 정치외교학과','연세대학교 일반대학원 국어학 석사과정','정교사 2급 교원자격증 취득','중앙대학교 · 연세대학교 인문논술 합격','2026년 이투스북 연간검토단','김포 당신을위한유어랩학원 국어 담당'],
   subjects_teach:['국어(고3·N수)','면접·컨설팅'],target:'고3 / N수',blogLinks:[{title:'김동완T 강사 소개',url:'https://blog.naver.com/edumate_mokdong/223439213179'},{title:'생기부 기반 면접 대비반 진행 방식',url:'https://blog.naver.com/yourmate_gimpo/224448440567'},{title:'[후기] 국어 김동완T 수강후기',url:'https://blog.naver.com/edumate_mokdong/224207132313'},{title:'[합격수기] 한양대 음대 합격생 합격수기',url:'https://blog.naver.com/edumate_mokdong/224182881117'}]},
  {name:'안호수',filters:['수학','논술'],role:null,subjects:['수학','논술'],
   msg:'내 사전에 수포자는 없다',tags:['과외어플 전국 상위 2%','유어랩학원','수학 전임'],
   career:['메이트학원 수학과 전임강사','김포 당신을위한유어랩학원 S반(특목반) 담당','과외어플 전국 상위 2%'],
   subjects_teach:['수능 수학','내신 수학','약술논술(수학)'],target:'고1·2·3 / N수',videos:[{title:'고2 2026년 3월 교육청 모의고사 해설강의(주요문항)',id:'RoNBmnzKfE0'}],blogLinks:[{title:'수학 개인관리반 진행 방식',url:'https://blog.naver.com/edumate_mokdong/224375783358'},{title:'[후기] 약술 논술 수강후기',url:'https://blog.naver.com/edumate_mokdong/224184462106'}]},
  {name:'윤서은',filters:['수학'],role:null,subjects:['수학'],
   msg:'당신을 위한 수학, 실전 수학',tags:['연세대'],
   career:['메이트학원 수학과 강사','연세대학교','前) 광주 E학원'],
   subjects_teach:['수능 수학','내신 수학'],target:'고1·2·3 / N수',blogLinks:[{title:'수학 개인관리반 진행 방식',url:'https://blog.naver.com/edumate_mokdong/224375783358'},{title:'관리형 수학 수업 성과 공개 (학생 후기 포함)',url:'https://blog.naver.com/edumate_mokdong/224339373781'},{title:'[후기] 수학 윤서은T 수강후기',url:'https://blog.naver.com/edumate_mokdong/224213075509'}]},
  {name:'이나경',filters:['수학'],role:null,subjects:['수학'],
   msg:'너만을 위한 수학 멘토',tags:['서울대 컴퓨터공학'],
   career:['메이트학원 수학과 강사','서울대학교 컴퓨터공학부'],
   subjects_teach:['수능 수학','내신 수학'],target:'예비고1·고1·2',blogLinks:[{title:'이나경T 강사 소개',url:'https://blog.naver.com/edumate_mokdong/224368407374'},{title:'수학 개인관리반 진행 방식',url:'https://blog.naver.com/edumate_mokdong/224375783358'}]},
  {name:'최예빈',filters:['영어'],role:null,subjects:['영어'],
   msg:'전략 과목을 대하는 가장 전략적인 방법',tags:['영어 전임'],
   career:['메이트학원 영어과 전임강사','동두천외국어고등학교 졸업','前) 경기 C학원'],
   subjects_teach:['수능 영어','내신 영어'],target:'고1·2·3',blogLinks:[]},
  {name:'권세은',filters:['영어'],role:null,subjects:['영어'],
   msg:'감이 아니라 구조로 보는 영어',tags:['영어 전임','과외어플 전국 상위 0.2%'],
   career:['메이트학원 영어과 전임강사','과외어플 전국 상위 0.2%','목동초등학교 · 목동중학교 · 진명여고 졸업'],
   subjects_teach:['수능 영어','내신 영어'],target:'고1·2·3 / N수',
   videos:[{title:'2027학년도 9월 평가원 모의고사 해설강의(주요문항)',id:'ee_qijo6E3M'},{title:'수능 영어 어법 총정리',id:'OxbckhhrfeA'}],blogLinks:[{title:'권세은T 강사 소개',url:'https://blog.naver.com/yourmate_gimpo/224333383667'},{title:'신목고2 내신 분석',url:'https://blog.naver.com/edumate_mokdong/224434115070'},{title:'권세은T 수능 영어 커리큘럼',url:'https://blog.naver.com/yourmate_gimpo/224359529122'},{title:'[후기] 영어 권세은T 수강후기',url:'https://blog.naver.com/edumate_mokdong/224264042226'}]},
  {name:'정다혜',filters:['영어'],role:null,subjects:['영어'],
   msg:'영어를 마스터하는 가장 빠르고 정확한 방법',tags:[],
   career:['메이트학원 영어과 강사'],
   subjects_teach:['수능 영어','내신 영어','클리닉'],target:'고1·2·3',blogLinks:[]},
  {name:'김동률',hidden:true,/* 2026-11-13 원장님 요청으로 잠시 숨김 — 지우면 다시 보임 */filters:['영어'],role:null,subjects:['영어'],
   msg:'눈이 아니라 머리로 읽는 영어',tags:['연세대 영어영문학','MATE VOCA'],
   career:['메이트학원 영어과 강사','메이트학원 영단어교재 &lt;MATE VOCA&gt; 집필','연세대학교 영어영문학과'],
   subjects_teach:['수능 영어','내신 영어'],target:'예비고1·고1·2·3',blogLinks:[]},
  {name:'김경민',filters:['사회'],role:null,subjects:['사회'],
   msg:'티칭과 코칭으로 사회의 정답',tags:['과외어플 전국 상위 0.2%','2026년 이투스북 연간검토단'],
   career:['메이트학원 사회과 강사','과외어플 전국 상위 0.2%','2026년 이투스북 연간검토단'],
   subjects_teach:['통합사회'],target:'고1',blogLinks:[{title:'[후기] 통합사회 김경민T 수강후기',url:'https://blog.naver.com/edumate_mokdong/224215404135'}]},
  {name:'남매논술팀',team:true,filters:['논술'],role:null,subjects:['논술'],
   msg:'네 번의 합격이 말해주는 인문논술의 정답',tags:['김동완 · 김소진','연세대 국어국문학'],
   career:[],careerGroups:[
    {name:'김동완',items:['메이트학원 대표원장','연세대학교 국어국문학과 · 정치외교학과','연세대학교 일반대학원 국어학 석사과정','중앙대학교 · 연세대학교 인문논술 합격']},
    {name:'김소진',items:['메이트학원 부원장','연세대학교 국어국문학과','이화여자대학교 인문논술 합격','연세대학교 편입논술 합격']}],
   subjects_teach:['인문논술','약술논술'],target:'고3 / N수',blogLinks:[{title:'인문논술 수업 방식',url:'https://blog.naver.com/edumate_mokdong/224350956422'},{title:'[후기] 약술 논술 수강후기',url:'https://blog.naver.com/edumate_mokdong/224184462106'}]}
];

const T_FIRST=['임한비','정예진','김소진','김동완','윤서은','이나경','안호수'];

/* 시간표(반·요일·시간·수업 소개)는 이 파일에 적지 않는다.
   「메이트 강의목록」 구글 시트에서 자동으로 읽어 옴 — 시트만 고치면 됨 */
