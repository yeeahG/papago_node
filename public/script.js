const textAreaArray = document.querySelectorAll('textarea');
console.log(textAreaArray);

//변수 네이밍 컨벤션, 용어 정의(도메인과 관련된)
//source : 번역할 텍스트들과 관련된 명칭
//target : 번역된 결과와 관련된 명칭
const [sourceTextArray, targetTextArray] = textAreaArray;
//console.log(sourceTextArray);
//console.log(targetTextArray);

const [sourceSelect, targetSelect] = document.querySelectorAll('select');
//console.log(sourceTextArray, targetTextArray);

//번역 할 언어의 타입(ko인지 jp인지 en인지)
let targetLanguage = 'en';
//'ko' -> 'jp'로 바뀌는 event

//console.dir(targetSelect);
//console.log(targetSelect.options[targetSelect.selectedIndex].value);
//어떤 언어로 번역할지 선택하는 target selectbox의 선택지 값이 바뀔 때마다 이벥트 발생
targetSelect.addEventListener('change', ()=>{
    const selectedIndex = targetSelect.selectedIndex;
    targetLanguage=targetSelect.options[selectedIndex].value;
});

let debouncer;

sourceTextArray.addEventListener('input', (event) => {

    if (debouncer) { //값이 있으면 true 없으면 false
        clearTimeout(debouncer);
    }

    debouncer = setTimeout( () => {

        //1. 어떤 이벤트인가
        //2. textarea에 입력한 값은 어떻게 가져올 수 있을까
        //console.dir(event);
        //console.log(event.target.value);
        const text = event.target.value; //textarea에 입력된 값
        // console.log(text);

        //예외처리
        if (text) {
            //이름이 xml일 뿐이지 XML에 국한되지 않음
            const xhr = new XMLHttpRequest();
            
            const url = '/detectLangs'; //node서버로 요청(특정 url 지정한 것)
            
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 & xhr.status == 200) {
                            //서버의 응답 결과 확인 (responseText : 응답에 포함된 텍스트)
                            //console.log(typeof xhr.responseText);
                            //console.log(xhr.responseText);
                            const responseData = xhr.responseText;
                            console.log(`responseData: ${responseData}, type: ${typeof responseData}`);
                            const parseJsonToObject = JSON.parse(JSON.parse(responseData));
                            //두 번 파싱 해야하는 이유 : https://stackoverflow.com/questions/30194562/json-parse-not-working/49460716
            
                            console.log(typeof parseJsonToObject, parseJsonToObject);
            
                            //parseJsonToObject[`message`];
                            const result = parseJsonToObject[`message`][`result`];
                            const options = sourceSelect.options;

                            for (let i=0; i<options.length; i++) {
                                if (options[i].value===result['srcLangType']) {
                                    sourceSelect.selectedIndex = i;
                                }
                            }


            
                            //번역된 결과 텍스트를 출력
                            targetTextArray.value = result['translatedText']
            
                            //응답의 헤더 확인
                            //console.log(`응답헤더 : ${xhr.getAllResponseHeaders()}`);
                        }
                    };


                    /*
                    xhr.addEventListener('load', () => { //로딩이 완료되었을 때 실행
                        if (xhr.status == 200) {
                            //내부 코드는 동ㅇ일
                        }
                    });
                    
                    */
            
                    xhr.open("POST", url);
            
                    //서버에 보내는 요청 데이터의 형식이 json 형식임을 표시
                    xhr.setRequestHeader("Content-type", "application/json");
                    
                    const requestData = { 
                        //typeof : object인데 json type은 string 
                        //->json type으로 바꿔서 보내야함 (직렬화)
                        text, 
                        targetLanguage
                    };
            
                    //그래서 json type으로 변환시켜줌
                    //내장모듈 JSOn 활용
                    //서버에 보낼 데이터를 문자열 화 시킴
                    //JSON.stringify(requestData); 를 밑에 변수로 담음
                    jsonToString = JSON.stringify(requestData);
                    //console.log(typeof jsonToString);
            
                    //xhr = XMLHttpRequest
                    xhr.send(jsonToString);
        } else {
            alert(`내용을 입력해주세요`)
        }

    }, 3000);

}) ;