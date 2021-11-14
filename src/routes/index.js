const express = require('express');
const router = new express.Router();
const moment = require('moment');

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

router.get('/', async function(req, res, next) {
  res.render('list', { title: 'Express'});
});

/* GET home page. */
router.get('/quiz', async function(req, res, next) {
  const params = req.query;
  const part = parseInt(params.part);
  const mongoClient = req.app.locals.mongoClient;

  let match;
  let all;
  let use;
  let correct;

  if(part > 0)
  {
    match = {
      'record.use': false,
      'part' : part
    }
    all = await mongoClient.db('skpark').collection('quiz').count({'part' : part});
    use = await mongoClient.db('skpark').collection('quiz').count({'record.use' : true, 'part' : part});
    correct = await mongoClient.db('skpark').collection('quiz').count({'record.correct' : true, 'part' : part});
  } else {
    match = {
      'record.use': false
    }
    all = await mongoClient.db('skpark').collection('quiz').count({});
    use = await mongoClient.db('skpark').collection('quiz').count({'record.use' : true});
    correct = await mongoClient.db('skpark').collection('quiz').count({'record.correct' : true});
  }

  const query = [{
    $match: match
  }, {
    $sample: {
      size: 1
    }
  }];

  // console.log(rnd);
  const q = await mongoClient.db('skpark').collection('quiz').aggregate(query).toArray();

  const info = {
    questionCount : all,
    useCount : use,
    correctCount : correct
  }

  let history;

  if(!q[0].history)
  {
    history = [];
  } else {
    history = q[0].history;
  }

  res.render('index', { title: 'Express', list: q[0], info, part, history });
});

// 정답 체크
router.post('/check', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const answer = JSON.parse(req.body.txtBody);
  const question = answer.question.trim();

  const history = {
    correct : answer.result,
    krTime : moment().format('YYYY-MM-DD HH:mm:ss')
  }

  const query = {
    question : question,
    record : {
      use : true,
      correct : answer.result,
      correctCount : answer.result === true ? 1 : 0,
    }
  }
  const q = await mongoClient.db('skpark').collection('quiz').updateOne({'no' : answer.no}, {$push: { history : history}}, {$set: query});

  res.redirect('/quiz?part=' + answer.part);
});

// 문제 등록 화면 로딩 

router.get('/regist', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const q = await mongoClient.db('skpark').collection('quiz').find().sort({'no' : -1}).limit(1).toArray();
  res.render('regist', {no : q[0].no +1});
});

router.get('/modify/:id', async (req,res,next) => {
  const no = parseInt(req.params.id);
  const mongoClient = req.app.locals.mongoClient;
  const q = await mongoClient.db('skpark').collection('quiz').findOne({'no' : no});
  res.render('modify', q);
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

router.post('/modify', async (req,res,next) => {
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

  const q = await mongoClient.db('skpark').collection('quiz').updateOne({'no' : no}, {$set: item});
  res.redirect('modify/' + no);
});

module.exports = router;
