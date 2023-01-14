# etatsCityChecker
에타츠 시티 체커

# IDE에서 실행 시 주의 사항
시티 체커를 빌드를 하지 않고 IDE에서 실행해야하는 경우 resources 폴더에서 city_checker.xlsx 파일을 소스 최상위로 복사해주셔야 합니다.

# 주의 사항
시티 체커는 위키의 데이터를 기반으로 체크를 진행하는 것으로 각 국의 주지사 위키를 갱신해주셔야 제대로 된 데이터로 추출이 됩니다.

실행하시기 전에 에타츠 위키에서 각 주의 주지사 목록을 갱신해주시기 바랍니다.


# 최초 실행시
압축파일내에 동봉된 install.bat 파일을 실행 한 뒤 아래의 방법을 진행해주시기 바랍니다.


# 사용 방법
1. 압축을 해제한 뒤 city_checker.xlsx 엑셀 파일을 연다.
2. A3셀부터 아래로 체크 할 주 명칭을 입력한다.
3. 저장 후 같이 동봉된 CityChecker.exe 프로그램을 실행한다.
4. cmd창과 같이 파란색 아이콘의 크롬이 실행될것인데 둘다 종료가 되면 city_checker.xlsx 엑셀 파일을 확인한다.


# Build
[Requirement]
* Node.js v16.19.0
* node-gyp v8.1.0
* pkg v5.8.0
* Python 3.8

[Make]
```javascript
npm run build
```
