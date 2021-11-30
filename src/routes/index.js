const express = require('express');
const router = new express.Router();
const moment = require('moment');

router.get('/', async function(req, res, next) {
  res.render('list', { title: 'Express'});
});

router.put('/reset/:id', async function(req, res, next) {
  const part = parseInt(req.params.id);
  const mongoClient = req.app.locals.mongoClient;
  let q;
  let query = {
    'record.use': false,
    'record.correct': false,
  }
  
  if (part > 0) {
    q = await mongoClient.db('skpark').collection('quiz').updateMany({'part' : part}, {$set: query});
  } else {
    q = await mongoClient.db('skpark').collection('quiz').updateMany({}, {$set: query});
  }

  res.send('success');
});

/* GET home page. */
router.get('/quiz', async function(req, res, next) {
  const params = req.query;
  const part = parseInt(params.part);
  const mongoClient = req.app.locals.mongoClient;
  const setPercent = 100;

  let match;
  let all;
  let use;
  let correct;
  let percent = 0;
  let correctPercent = 0;

  if(part > 0)
  {
    match = {
      'record.use': false,
      'part' : part,
      'record.correctPercent' : { $lte : setPercent}
    }
    all = await mongoClient.db('skpark').collection('quiz').count({'part' : part, 'record.correctPercent' : { $lte : setPercent}});
    use = await mongoClient.db('skpark').collection('quiz').count({'record.use' : true, 'part' : part, 'record.correctPercent' : { $lte : setPercent}});
    correct = await mongoClient.db('skpark').collection('quiz').count({'record.correct' : true, 'part' : part, 'record.correctPercent' : { $lte : setPercent}});
  } else {
    match = {
      'record.use': false,
      'record.correctPercent' : { $lte : setPercent}
    }
    all = await mongoClient.db('skpark').collection('quiz').count({'record.correctPercent' : { $lte : setPercent}});
    use = await mongoClient.db('skpark').collection('quiz').count({'record.use' : true, 'record.correctPercent' : { $lte : setPercent}});
    correct = await mongoClient.db('skpark').collection('quiz').count({'record.correct' : true, 'record.correctPercent' : { $lte : setPercent}});
  }

  percent = Math.round(use / all *100);
  correctPercent = Math.round(correct / use *100);
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
    correctCount : correct,
    percent : percent,
    correctPercent : correctPercent
  }
  let history;
  if(q.length === 0)
  {
    res.render('list', { title: 'Express'});
  } else {
    if(!q[0].history)
    {
      history = [];
    } else {
      history = q[0].history;
    }
  
    res.render('index', { title: 'Express', list: q[0], info, part, history });
  }


});

// 정답 체크
router.post('/check', async (req,res,next) => {
  const mongoClient = req.app.locals.mongoClient;
  const answer = JSON.parse(req.body.txtBody);
  const question = answer.question.trim();

  const record = await mongoClient.db('skpark').collection('quiz').findOne({'no' : answer.no});
  const allHistoryCount = record.history.length + 1;
  const correctCount = record.record.correctCount + (answer.result === true ? 1 : 0);
  const correctPercent =  Math.round(correctCount / allHistoryCount *100);


  const history = {
    correct : answer.result,
    krTime : moment().format('YYYY-MM-DD HH:mm:ss')
  }

  const query = {
    question : question,
    record : {
      use : true,
      correct : answer.result,
      correctCount : correctCount,
      correctPercent : correctPercent
    }
  }
  const q1 = await mongoClient.db('skpark').collection('quiz').updateOne({'no' : answer.no}, {$set: query});
  const q2 = await mongoClient.db('skpark').collection('quiz').updateOne({'no' : answer.no}, {$push: { history : history}});

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
    "answer" : []
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
