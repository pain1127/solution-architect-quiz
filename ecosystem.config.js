'use strict';

module.exports = {
    apps: [
        {
            name: "seonghwan-test", // pm2로 실행한 프로세스 목록에서 이 애플리케이션의 이름으로 지정될 문자열
            script: "src/server.js", // pm2로 실행될 파일 경로
            watch: true, // 파일이 변경되면 자동으로 재실행 (true || false)
            env: { // 환경변수. 모든 배포 환경에서 공통으로 사용한다..
              'NODE_ENV': 'develop',
              'USE_PORT': '3010',
              'DB_CONNECTION': 'mongodb+srv://kshhawk:tjd88ghks@cluster0.2tsrv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
            }
        }
    ]
};
