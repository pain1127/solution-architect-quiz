const express = require('express');
const router = new express.Router();
const xlsx = require('xlsx');

/* GET home page. */
router.get('/rand', async function(req, res, next) {
  const mongoClient = req.app.locals.mongoClient;

  const rnd = getRandomInt(1,4);

  // console.log(rnd);
  const q = await mongoClient.db('skpark').collection('quiz').aggregate(
    [{
      $match: {
        'record.use': false
      }
    }, {
      $sample: {
        size: 1
      }
    }]
  ).toArray();

  res.send(q[0]);
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  const mongoClient = req.app.locals.mongoClient;

  // console.log(rnd);
  const q = await mongoClient.db('skpark').collection('quiz').aggregate(
    [{
      $match: {
        'record.use': false
      }
    }, {
      $sample: {
        size: 1
      }
    }]
  ).toArray();

  res.render('index', { title: 'Express', list: q[0] });
});

// 문제 리스트 로딩

router.get('/list', async function(req, res, next) {
  const mongoClient = req.app.locals.mongoClient;

  // console.log(rnd);
  const q = await mongoClient.db('skpark').collection('quiz').find({'record.use' : false}).sort({ 'no' : 1}).limit(1).toArray();


  res.render('index', { title: 'Express', list: q[0] });
});

// 정답 체크

router.post('/check', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const question = req.body;
  const query = {
    question : question.question,
    record : {
      use : true,
      correctCount : question.result === true ? 1 : 0,
    }
  }
  const q = await mongoClient.db('skpark').collection('quiz').updateOne({'no' : question.no}, {$set: query});

  res.send('test');
});

// 문제 등록 화면 로딩 

router.get('/regist', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const q = await mongoClient.db('skpark').collection('quiz').find().sort({'no' : -1}).limit(1).toArray();
  res.render('regist', {no : q[0].no +1});
});

// 문제 등록 처리 

router.post('/regist', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const no = parseInt(req.body.txtNo, 10);

  let item = {
    "no" : parseInt(req.body.txtNo, 10),
    "question" : req.body.txtQuestion,
    "answer" : [],
    "record" : {
      "use" : false,
      "correctCount" : 0
    }
  }

  if(req.body.txtAnswerA) {
    item.answer.push({'name' : 'A', 'text' : req.body.txtAnswerA.replace(/[\r\n]/g, ""), 'correct' : req.body.chkAnswerA !== undefined ? true : false});
  }

  if(req.body.txtAnswerB) {
    item.answer.push({'name' : 'B', 'text' : req.body.txtAnswerB.replace(/[\r\n]/g, ""), 'correct' : req.body.chkAnswerB !== undefined ? true : false});
  }

  if(req.body.txtAnswerC) {
    item.answer.push({'name' : 'C', 'text' : req.body.txtAnswerC.replace(/[\r\n]/g, ""), 'correct' : req.body.chkAnswerC !== undefined ? true : false});
  }

  if(req.body.txtAnswerD) {
    item.answer.push({'name' : 'D', 'text' : req.body.txtAnswerD.replace(/[\r\n]/g, ""), 'correct' : req.body.chkAnswerD !== undefined ? true : false});
  }

  if(req.body.txtAnswerE) {
    item.answer.push({'name' : 'E', 'text' : req.body.txtAnswerE.replace(/[\r\n]/g, ""), 'correct' : req.body.chkAnswerE !== undefined ? true : false});
  }

  if(req.body.txtAnswerF) {
    item.answer.push({'name' : 'F', 'text' : req.body.txtAnswerF.replace(/[\r\n]/g, ""), 'correct' : req.body.chkAnswerF !== undefined ? true : false});
  }

  const q = await mongoClient.db('skpark').collection('quiz').insertOne(item);
  res.render('regist', {no : no +1});
});

router.post('/', async (req,res,next) => {

  const mongoClient = req.app.locals.mongoClient;
  const workbook = xlsx.readFile('/users/skpark/downloads/quiz.xlsx');

  const sheet = workbook.Sheets['Sheet1'];
  for(let i=1; i<=19; i++)
  {
    let item = {
      "no" : 0,
      "question" : '',
      "answer" : [],
      "record" : {
        "use" : false,
        "correctCount" : 0
      }
        // "A" :  {
        //   "text" : '',
        //   "correct" : false,
        // },
        // "B" :  {
        //   "text" : '',
        //   "correct" : false,
        // },
        // "C" :  {
        //   "text" : '',
        //   "correct" : false,
        // },
        // "D" :  {
        //   "text" : '',
        //   "correct" : false,
        // },
        // "E" :  {
        //   "text" : '',
        //   "correct" : false, // sheet['M2'] === undefined ? false :sheet['M2'].v,
        // },
        // "F" :  {
        //   "text" : '',
        //   "correct" : false,
        // },
     // }
    }
  
    item.no = sheet['A' + i].v;
    item.question = sheet['B' + i].v;

    if(sheet['I' + i] !== undefined)
    {
      item.answer.push({'name' : 'A', 'text' : sheet['C' + i].v, 'correct' : sheet['I' + i].v});
    }

    if(sheet['J' + i] !== undefined)
    {
      item.answer.push({'name' : 'B', 'text' : sheet['D' + i].v, 'correct' : sheet['J' + i].v});
    }

    if(sheet['K' + i] !== undefined)
    {
      item.answer.push({'name' : 'C', 'text' : sheet['E' + i].v, 'correct' : sheet['K' + i].v});
    }

    if(sheet['L' + i] !== undefined)
    {
      item.answer.push({'name' : 'D', 'text' : sheet['F' + i].v, 'correct' : sheet['L' + i].v});
    }

    if(sheet['M' + i] !== undefined)
    {
      item.answer.push({'name' : 'E', 'text' : sheet['G' + i].v, 'correct' : sheet['M' + i].v});
    }
    if(sheet['N' + i] !== undefined)
    {
      item.answer.push({'name' : 'F', 'text' : sheet['H' + i].v, 'correct' : sheet['N' + i].v});
    }

    // item.answer.A.text = sheet['C' + i].v;
    // item.answer.A.correct = sheet['I' + i].v;
    // item.answer.B.text = sheet['D' + i].v;
    // item.answer.B.correct = sheet['J' + i].v;
    // item.answer.C.text = sheet['E'+ i].v;
    // item.answer.C.correct = sheet['K'+ i].v;
    // item.answer.D.text = sheet['F'+ i].v;
    // item.answer.D.correct = sheet['L'+ i].v;
  
    // if(sheet['M' + i] !== undefined)
    // {
    //   item.answer.E.text = sheet['G'+ i].v;
    //   item.answer.E.correct = sheet['M'+ i].v;
    // }
  
    // if(sheet['N'+ i] !== undefined)
    // {
    //   item.answer.F.text = sheet['H'+ i].v;
    //   item.answer.F.correct = sheet['N'+ i].v;
    // }

    // console.log(item);
    const q = await mongoClient.db('skpark').collection('quiz').insertOne(item);
  }

  // const question = {
  //   "question" : "최근 한 스타트 업 회사가 대규모 전자 상거래 웹 사이트를 AWS로 마이그레이션했습니다. 웹 사이트 매출이 70 % 증가했습니다. 소프트웨어 엔지니어는 개인 GitHub 저장소를 사용하여 코드를 관리하고 있습니다. 개발 팀 은 빌드 및 단위 테스트에 Jenkins를 사용하고 있으며, 엔지니어는 배포 중 다운 타임없이 잘못된 빌드에 대한 알림을 받아야합니다. 또한 엔지니어는 생산 변경 사항이 사용자에게 원활하고 중대한 문제가 발생할 경우 롤백 할 수 있는지 확인해야합니다. 소프트웨어 엔지니어는 AWS CodePipline을 사용하여 빌드 및 배포 프로세스를 관리하기로 결정했습니다. 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?",
  //   "ansewer" : {
  //     "A" :  {
  //       "text" : "GitHub 웹 소켓을 사용하여 CodePipeline 파이프 라인을 트리거합니다. AWS CodeBuild 용 Jenkins 플러그인을 사용하여 단위 테스트를 수행합니다. 잘못된 빌드에 대한 경고를 Amazon SNS 주제에 전송합니다. AWS CodeDeploy를 사용하여 한 번에 전체 배포 구성으로 배포합니다.",
  //       "correct" : false,
  //     },
  //     "B" : {
  //       "text" : "GitHub 웹훅을 사용하여 CodePipeline 파이프 라인 트리거 AWS CodeBuild 용 Jenkins 플러그인을 사용하여 단위 테스트를 수행합니다. 잘못된 빌드에 대해 Amazon SNS 주제에 알림을 보냅니다. AWS CodeDeploy를 사용 하여 블루 / 그린 배포로 배포합니다.",
  //       "correct" : false,
  //     },
  //     "C" :  {
  //       "text" : "GitHub 웹 소켓을 사용하여 CodePipelin 파이프 라인을 트리거합니다. 단위 테스트 및 정적 코드 분석에 AWS X-Ray를 사용하십시오. 잘못된 빌드에 대한 경고를 Amazon SNS 주제로 전송 AWS CodeDeploy를 사용하여 블루 / 그린 배포에 배포합니다.",
  //       "correct" : false,
  //     },
  //     "D" : {
  //       "text" : "GitHub 웹훅을 사용하여 CodePipeline 파이프 라인을 트리거합니다. 단위 테스트 및 정적 코드 분석에 AWS X-Ray를 사용하십시오. AWS CodeDeploy를 사용하여 일괄 배포 구성에서 배포 된 빌드에 대한 알림을 Amazon SNS 주제로 보냅니다.",
  //       "correct" : false,
  //     }
  //   }
  // };

  // const q = await mongoClient.db('skpark').collection('quiz').insertOne(question);
  // res.send(q);
  res.send('test');
});

module.exports = router;
