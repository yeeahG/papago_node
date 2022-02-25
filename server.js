const express = require("express"); //express 패키지를 import한다는 뜻
const app = express();

//API key를 별도관리 : dot(.)env 활용
//.env라는 파일에 key를 보관하고 dot env가 .env파일을 활용해서 process.env객체에 포함시킴
const dotenv = require('dotenv');
dotenv.config();

const clientId=process.env.CLIENT_ID
const clientSecret=process.env.CLIENT_SECRET

// node.js 서버가 또 다른 client가 되어 naver 서버에 요청을 보내기 위해 사용
const request = require('request');
const { type } = require("express/lib/response");

//express의 static 미들웨어 활용
app.use(express.static('public'))

//express의 json 미들웨어 활용
app.use(express.json());

console.log(`현재 파일명 :  ${__filename}`);
console.log(`index.html의 파일경로 : ${__dirname}`);
// public/~~

//기본 root url : localhost:3000/ ==lcoalhost:3000
//해당 결로로 요청이 들어왔을 때 호출될 함수
//두 인자값 (argument)르 받음 - req, res
app.get("/", (req, res) => {
  //root url은 메인 페이지로 들어왔을 때 papago 메인 페이지가 나와야함
  //res.sendFile('index.html'); //이 경로를 찾지 못함
  res.sendFile(__dirname, 'index.html');
});

//detectLangs로 요청했을 때
app.post("/detectLangs", (req, res) => {
  //안녕이라는 text를 받아야함
  //console.log(text); //안녕 값이 들어와야함

  console.log(req.body);
  console.log(typeof req.body);

  const {text:query, targetLanguage} = req.body;
  // console.log(query);
  // console.log(targetLanguage); //이렇게 하면 확인됨
  const url = "https://openapi.naver.com/v1/papago/detectLangs";
  const options = {
    url, 
    form: {query: query}, //보낼 text 쿼리
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    }
  }

  //naver 서버로 보낼 것
  //options 요청에 필요한 데이터 동봉
  //() => {} 요청에 따른 응답정보를 확인
  request.post(options, (error, response, body) => {
    if (!error && response.statusCode ==200) {
      //console.log(body); 
      //body의 타입이 string이여서 object로 파씽
      const parseBody = JSON.parse(body);
      console.log(typeof parseBody, parseBody);

      //papago 번역 url로 redirect(재요청)
      res.redirect(`translate?lang=${parseBody['langCode']}&targetLanguage=${targetLanguage}&query=${query}`);
      //query string으로 데이터 전송 (get 요청)
      //localhost:3000/translate?lang=ko&targetLanguage=en&query=%20%~~

    } else {
      console.log(`error = ${response.statusCode}`);
    }
  });

});

//papago 번역 API 레퍼런스
//언어가 입력되면 redirect를 통해서 translate로 가게됨
app.get("/translate", (req, res) => {
  const url = "https://openapi.naver.com/v1/papago/n2mt";
  console.log(req.query, typeof req.query);
  const options = {
    url, 
    form: {
      //query string으로 받은 값들 mapping & binding
      source: req.query['lang'],
      target: req.query['targetLanguage'],
      text: req.query['query'],
    },
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  }
  request.post(options, (error, response, body) => {
    if (!error && response.statusCode ==200) {
      res.json(body); //script.js에 해당하는 sctipt.js에 응답데이터(json) 전송
    //json() - stringify()가 적용된 메서드
    } else {
      console.log(`error = ${response.statusCode}`);
    }
  });
});


app.listen(3000, () => {
  console.log("http://127.0.0.1:3000/ app listening on port 3000");
});