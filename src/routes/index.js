const express = require('express');
const router = new express.Router();
const xlsx = require('xlsx');

/* GET home page. */
// router.get('/rand', async function(req, res, next) {
//   const mongoClient = req.app.locals.mongoClient;

//   const rnd = getRandomInt(1,4);

//   // console.log(rnd);
//   const q = await mongoClient.db('skpark').collection('quiz').aggregate(
//     [{
//       $match: {
//         'record.use': false
//       }
//     }, {
//       $sample: {
//         size: 1
//       }
//     }]
//   ).toArray();

//   res.send(q[0]);
// });

/* GET home page. */
router.get('/quiz', async function(req, res, next) {
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

  const all = await mongoClient.db('skpark').collection('quiz').count({});
  const use = await mongoClient.db('skpark').collection('quiz').count({'record.use' : true});
  const correct = await mongoClient.db('skpark').collection('quiz').count({'record.correct' : true});

  const info = {
    questionCount : all,
    useCount : use,
    correctCount : correct
  }

  res.render('index', { title: 'Express', list: q[0], info });
});

// 문제 리스트 로딩

// router.get('/list', async function(req, res, next) {
//   const mongoClient = req.app.locals.mongoClient;

//   // console.log(rnd);
//   const q = await mongoClient.db('skpark').collection('quiz').find({'record.use' : false}).sort({ 'no' : 1}).limit(1).toArray();
//   const use = await mongoClient.db('skpark').collection('quiz').count({'record.use' : false});
//   const correct = await mongoClient.db('skpark').collection('quiz').count({'record.correct' : false});


//   res.render('index', { title: 'Express', list: q[0] });
// });

// 정답 체크

router.post('/check', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const question = req.body;
  // const text = question.question.trim();
  // console.log(text);
  const query = {
    record : {
      use : true,
      correct : question.result,
      correctCount : question.result === true ? 1 : 0,
    }
  }
  const q = await mongoClient.db('skpark').collection('quiz').updateOne({'no' : question.no}, {$set: query});

  res.redirect('/quiz');
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

module.exports = router;
