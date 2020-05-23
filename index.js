const express = require('express');
const multer  = require('multer');
const md5 = require('md5');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const mkdirp = require('mkdirp');
const cors = require('cors');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // let mdTitle = md5();

    // console.log('TITLE - ', mdTitle);

    cb(null, `uploads/`);

  },
  filename: function (req, file, cb) {
    let mdTitle = md5(file.originalname);
    // console.log('FROM STORAGE - ', req.body);

    let storageFilename = 'min' + '-' + mdTitle + '.jpg';
    let splitStr = storageFilename.split('-');

    console.log('FILENAME - ',splitStr);
    cb(null, storageFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3000000 },
  fileFilter: (req, file, cb) => {
    console.log('FILE FILTER - ', file);
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true);
    }

    cb(null, false);
    // cb(new Error('Недопустимый формат файла'));
  }
});

const app = express();

app
  .use('/static', express.static(path.resolve(__dirname, 'uploads')))
  .use(cors());

app.post('/uploadImage', upload.single('image'), function (req, res, next) {
  // req.file - файл `preview`
  // req.body сохранит текстовые поля, если они будут
  // console.log('FILE - ',req.file);

  // let mdTitle = md5(req.query.title);
  // if(fs.existsSync(`uploads/${mdTitle}`)) {
  //   uploadPreview(req, res, (err) => {
  //     console.log(`File Preview ${req.query.title} NOT loaded`, err);
  //     if (err) return next(err);
  //       res.status(204).end();
  //   });
  // }


  let file = req.file.destination + req.file.filename;
  console.log('req.file ЫЫЫ - ', req.file);

  sharp(file)
  // .resize(400)
  .jpeg({ quality: 80, progressive: true, force: false })
  .png({ compressionLevel: 8, progressive: true, force: false })
  .toBuffer()
  .then(data => {
    console.log('PREVIEW SHARP DATA', data);
    fs.writeFile(file, data, (err) => {
      if(err) {
        return console.log(err);
      }

      console.log(`The file (${req.file.originalname}) was saved!`);

      res.json({ type: 'Image', file: req.file, body: req.body });
    });
  })
  .catch(err => { console.log('ERROR', err); });
});

app.listen(4000, function() {
  console.log('Express running on 4000');
});
