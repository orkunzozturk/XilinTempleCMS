// lifecycles.js
const fs = require("fs");
const { loadImage, registerFont, createCanvas } = require("canvas");
const mime = require('mime-types'); //used to detect file's mime type
const { env } = require("process");
const solarLunar = require('solarlunar');


const api_url = "http://localhost:1337";
const public_url = "https://content.xilinshuyuan.cn"
module.exports = {

  async afterUpdate(event) {
    console.log("running after update");
    let dataSource = event.params.data;
    if (
      dataSource.automaticPoster &&
      dataSource.automaticPoster == true
    ) {

      // get the image url associated with post:
      const imageResource = await strapi.entityService.findOne(
        "plugin::upload.file",
        `${dataSource.Image}`,
        {
          fields: ["url"],
        }
      );
      // convert the relative path as an absolute path to the ImageUrl field of the card content-type:
      const ImageUrl = public_url + JSON.parse(JSON.stringify(imageResource)).url;
      dataSource.ImageUrl = ImageUrl;

      // create a canvas


      // register custom fonts
      registerFont('static/MaShanZheng-Regular.ttf', { family: 'MaShanZheng-Regular' })
      registerFont('static/NotoSans-Bold.ttf', { family: 'NotoSans-Bold' })
      registerFont('static/NotoSans-Regular.ttf', { family: 'NotoSans-Regular' })
      registerFont('static/ZhiMangXing-Regular.ttf', { family: 'ZhiMangXing-Regular' })





      // Dimensions for the image
      const width = 428;
      const height = 835;
      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      //draw white bg
      ctx.fillStyle = "#FFFFFF"
      ctx.rect(0, 0, width, height)
      ctx.fill()
      // Draw a red rectangle with a white fill onto the canvas
      ctx.fillStyle = '#780E07';

      // Draw rectangle with rounded corners
      ctx.beginPath();
      ctx.roundRect(0, 0, 428, 281, [15, 15, 0, 0])
      ctx.stroke();

      // Fill the rectangle
      ctx.fill();

      // Set border color and width
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      // Draw border
      ctx.stroke();

      // resize bg image based on aspect ratio
      const backgroundImage = await loadImage(dataSource.ImageUrl);

      const imageAspectRatio = backgroundImage.width / backgroundImage.height;
      //get canvas aspect ratio, which is: 378/662.438=0.57
      const canvasAspectRatio = width / height;
      // Determine the aspect ratio of the image
      console.log("BG image aspect ratio is: " + imageAspectRatio + ", canvas aspect ratio is: " + canvasAspectRatio);
      // Calculate the scaled width and height of the image based on the canvas size and aspect ratio
      let scaledWidth, scaledHeight;
      if (imageAspectRatio > 1) {
        scaledHeight = height / 1.5
        scaledWidth = scaledHeight * imageAspectRatio;
      } else {
        scaledWidth = width
        scaledHeight = scaledWidth / imageAspectRatio;
      }
      // Set the focus position for the background image (values between 0 and 1)
      // TODO: Add focus selection to the frontend
      const focusX = 0.5; // 0 = left, 0.5 = center, 1 = right
      const focusY = 0; // 0 = top, 0.5 = center, 1 = bottom
      // Calculate the position of the top-left corner of the image based on the focus position
      let x = 0, y = 0;

      if (focusX == 0.5) {
        x = (width - scaledWidth) / 2;
        // console.log("x focus is center");
      } else if (focusX == 1) {
        x = width - scaledWidth;
        // console.log("x focus is right");
      } else if (focusX == 0) {
        x = (width - scaledWidth) / 2
        // console.log("y focus is left");
      }

      if (focusY == 0.5) {
        y = (height - scaledHeight) / 2;
        // console.log("y focus is center");
      } else if (focusY == 1) {
        y = height - scaledHeight;
        // console.log("y focus is bottom");
      } else if (focusY == 0) {
        y = 0
        // console.log("y focus is top");
      }

      const logo = await loadImage('static/xilinshuyuan.png');
      const qr = await loadImage('static/qrcode-white.png')
      // load the background image
      loadImage(dataSource.ImageUrl)
        .then((image) => {
          // draw the background image on the canvas
          ctx.drawImage(image, x, 281, scaledWidth, scaledHeight);
          ctx.globalAlpha = 0.3;

          // Draw a black rectangle over the image
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 281, canvas.width, canvas.height);
          ctx.globalAlpha = 1;

          // logo
          ctx.drawImage(logo, 40, 727.5, 90, 90);
          //qrcode
          ctx.drawImage(qr, 322, 174, 90, 90);


          // get calendar elements
          const date = dataSource.publishedAt ? dataSource.publishedAt : dataSource.updatedAt
          const year = date.getFullYear()
          const calendarMonth = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
          const month = calendarMonth[date.getMonth()]
          const day = date.getDate()
          const solar2lunarData = solarLunar.solar2lunar(year, month, day); // 输入的日子为公历


          const weekday = ["日", "一", "二", "三", "四", "五", "六"];
          const dayofweek = weekday[date.getDay()]

          // add Headline to the canvas
          ctx.fillStyle = "#F5F5E9";
          ctx.globalAlpha = 0.8;
          ctx.font = '96px "MaShanZheng-Regular"';
          ctx.textBaseline = 'ideographic';
          // Write vertical Chinese text
          const headline = '法雨西林';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          for (let i = 0; i < headline.length; i++) {
            const char = headline.charAt(i);
            ctx.fillText(char, 40, 96 + i * 96);
          }

          // add chinese date to the canvas
          ctx.fillStyle = "#F5F5E9";
          ctx.font = '20px "ZhiMangXing-Regular"';
          ctx.globalAlpha = 1;
          ctx.textBaseline = 'ideographic';
          // Write vertical Chinese calendar text
          const chinesedate = solar2lunarData.monthCn + solar2lunarData.dayCn + solar2lunarData.gzYear + "年" + solar2lunarData.animal + solar2lunarData.gzMonth + "月" + solar2lunarData.ncWeek;
          for (let i = 0; i < chinesedate.length; i++) {
            const char = chinesedate.charAt(i);
            ctx.fillText(char, 136, 372 + i * 20);
          }
          // gregorian calendar section
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = "#515352";
          ctx.font = '20px "NotoSans-Bold"';
          ctx.fillText(month, 354, 43);
          // triangle
          ctx.fillStyle = '#515352';
          ctx.beginPath();
          ctx.moveTo(358, 71);
          ctx.lineTo(370, 71);
          ctx.lineTo(364, 82);
          ctx.fill();

          ctx.fillStyle = '#515352';
          ctx.fill();
          ctx.fillText(day, 354, 82);
          // circle
          ctx.strokeStyle = '#515352';
          ctx.lineWidth = 1
          ctx.beginPath();
          ctx.arc(366.5, 133, 12.5, 0, 2 * Math.PI)
          ctx.stroke();
          // day of the week
          ctx.font = '17px "NotoSans-Regular"';
          ctx.fillStyle = "#515352";
          ctx.fillText(dayofweek, 358, 120);



          // Add Paragraph to image
          ctx.fillStyle = "#F5F5E9";
          ctx.font = '36px "MaShanZheng-Regular"';
          // Set maximum width and vertical spacing
          let lineHeight = 36;
          let lineSpacing = 40;
          // Split text into lines
          const text = dataSource.Paragraph;
          const chunks = text.match(/.{1,8}[\。，\n]?/g);
          console.log(chunks);
          chunks.forEach((chunk, i) => {
            for (let ci = 0; ci < chunk.length; ci++) {
              const char = chunk.charAt(ci);
              ctx.fillText(char, 266 + lineSpacing * i, 360 + ci * 36 + i * 79);
            }
          });
          // place the canvas to a png buffer
          const buffer = canvas.toBuffer("image/png");
          // save the buffer as a file
          fs.writeFileSync(`./.tmp/${dataSource.Headline}.png`, buffer);
          // upload the created file to strapi
          const fileName = `${dataSource.Headline}.png`;
          const filePath = `./.tmp/${fileName}`
          const stats = fs.statSync(filePath)
          return strapi.plugins.upload.services.upload.upload({
            populate: '*',
            data: {}, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.
            files: {
              path: filePath,
              name: fileName,
              type: mime.lookup(filePath), // mime type of the file
              size: stats.size,
            },
          });



        })
        .then((response) => {
          // console.log("File uploaded succesfully", response);
          const cardId = event.params.where.id
          const fileId = response[0].id;
          const fileUrl = response[0].url
          return strapi.query("api::card.card").update({
            where: { id: cardId },
            data: {
              Poster: fileId,
              PosterUrl: public_url + fileUrl
            }
          }
          )

        })
        .catch((err) => {
          console.error(err);
        });
    }
  },

  async afterCreate(event) {
    console.log("after create event: ");
    let dataSource = event.result;
    // console.log(dataSource);
    // console.log(event.params);
    if (
      dataSource.automaticPoster &&
      dataSource.automaticPoster == true
    ) {

      // get the image url associated with post:
      const imageResourceUrl = dataSource.Image.url
      console.log("image resource: " + imageResourceUrl);
      // // convert the relative path as an absolute path to the ImageUrl field of the card content-type:
      const imageUrl = public_url + imageResourceUrl
      dataSource.ImageUrl = imageUrl;
      console.log("Data image source link: " + dataSource.ImageUrl);

      // create a canvas
      // register custom fonts
      registerFont('static/MaShanZheng-Regular.ttf', { family: 'MaShanZheng-Regular' })
      registerFont('static/NotoSans-Bold.ttf', { family: 'NotoSans-Bold' })
      registerFont('static/NotoSans-Regular.ttf', { family: 'NotoSans-Regular' })
      registerFont('static/ZhiMangXing-Regular.ttf', { family: 'ZhiMangXing-Regular' })
      // Dimensions for the image
      const width = 428;
      const height = 835;
      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      //draw white bg
      ctx.fillStyle = "#FFFFFF"
      ctx.rect(0, 0, width, height)
      ctx.fill()
      // Draw a red rectangle with a white fill onto the canvas
      ctx.fillStyle = '#780E07';

      // Draw rectangle with rounded corners
      ctx.beginPath();
      ctx.roundRect(0, 0, 428, 281, [15, 15, 0, 0])
      ctx.stroke();

      // Fill the rectangle
      ctx.fill();

      // Set border color and width
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      // Draw border
      ctx.stroke();
      // resize bg image based on aspect ratio
      const backgroundImage = await loadImage(dataSource.ImageUrl);
      const logo = await loadImage('static/xilinshuyuan.png');
      const qr = await loadImage('static/qrcode-white.png')


      const imageAspectRatio = backgroundImage.width / backgroundImage.height;
      //get canvas aspect ratio, which is: 378/662.438=0.57
      const canvasAspectRatio = width / height;
      // Determine the aspect ratio of the image
      console.log("BG image aspect ratio is: " + imageAspectRatio + ", canvas aspect ratio is: " + canvasAspectRatio);
      // Calculate the scaled width and height of the image based on the canvas size and aspect ratio
      let scaledWidth, scaledHeight;
      if (imageAspectRatio > 1) {
        scaledHeight = height / 1.5
        scaledWidth = scaledHeight * imageAspectRatio;
      } else {
        scaledWidth = width
        scaledHeight = scaledWidth / imageAspectRatio;
      }
      // Set the focus position for the background image (values between 0 and 1)
      // TODO: Add focus selection to the frontend
      const focusX = 0.5; // 0 = left, 0.5 = center, 1 = right
      const focusY = 0; // 0 = top, 0.5 = center, 1 = bottom
      // Calculate the position of the top-left corner of the image based on the focus position
      let x = 0, y = 0;

      if (focusX == 0.5) {
        x = (width - scaledWidth) / 2;
        // console.log("x focus is center");
      } else if (focusX == 1) {
        x = width - scaledWidth;
        // console.log("x focus is right");
      } else if (focusX == 0) {
        x = (width - scaledWidth) / 2
        // console.log("y focus is left");
      }

      if (focusY == 0.5) {
        y = (height - scaledHeight) / 2;
        // console.log("y focus is center");
      } else if (focusY == 1) {
        y = height - scaledHeight;
        // console.log("y focus is bottom");
      } else if (focusY == 0) {
        y = 0
        // console.log("y focus is top");
      }


      // load the background image
      loadImage(dataSource.ImageUrl)
        .then((image) => {
          ctx.drawImage(image, x, 281, scaledWidth, scaledHeight);
          ctx.globalAlpha = 0.3;

          // Draw a black rectangle over the image
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 281, canvas.width, canvas.height);
          ctx.globalAlpha = 1;

          // logo
          ctx.drawImage(logo, 40, 727.5, 90, 90);
          //qrcode
          ctx.drawImage(qr, 322, 174, 90, 90);

          // get calendar elements
          const date = dataSource.publishedAt ? dataSource.publishedAt : new Date()
          console.log(date.getDate());
          const year = date.getFullYear()
          const calendarMonth = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
          const month = calendarMonth[date.getMonth()]
          const day = date.getDate()
          const solar2lunarData = solarLunar.solar2lunar(year, month, day); // 输入的日子为公历


          const weekday = ["日", "一", "二", "三", "四", "五", "六"];
          const dayofweek = weekday[date.getDay()]

          // add Headline to the canvas
          ctx.fillStyle = "#F5F5E9";
          ctx.globalAlpha = 0.8;
          ctx.font = '96px "MaShanZheng-Regular"';
          ctx.textBaseline = 'ideographic';
          // Write vertical Chinese text
          const headline = '法雨西林';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          for (let i = 0; i < headline.length; i++) {
            const char = headline.charAt(i);
            ctx.fillText(char, 40, 96 + i * 96);
          }

          // add chinese date to the canvas
          ctx.fillStyle = "#F5F5E9";
          ctx.font = '20px "ZhiMangXing-Regular"';
          ctx.globalAlpha = 1;
          ctx.textBaseline = 'ideographic';
          // Write vertical Chinese calendar text
          const chinesedate = solar2lunarData.monthCn + solar2lunarData.dayCn + solar2lunarData.gzYear + "年" + solar2lunarData.animal + solar2lunarData.gzMonth + "月" + solar2lunarData.ncWeek;
          for (let i = 0; i < chinesedate.length; i++) {
            const char = chinesedate.charAt(i);
            ctx.fillText(char, 136, 372 + i * 20);
          }
          // gregorian calendar section
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = "#515352";
          ctx.font = '20px "NotoSans-Bold"';
          ctx.fillText(month, 354, 43);
          // triangle
          ctx.fillStyle = '#515352';
          ctx.beginPath();
          ctx.moveTo(358, 71);
          ctx.lineTo(370, 71);
          ctx.lineTo(364, 82);
          ctx.fill();

          ctx.fillStyle = '#515352';
          ctx.fill();
          ctx.fillText(day, 354, 82);
          // circle
          ctx.strokeStyle = '#515352';
          ctx.lineWidth = 1
          ctx.beginPath();
          ctx.arc(366.5, 133, 12.5, 0, 2 * Math.PI)
          ctx.stroke();
          // day of the week
          ctx.font = '17px "NotoSans-Regular"';
          ctx.fillStyle = "#515352";
          ctx.fillText(dayofweek, 358, 120);



          // Add Paragraph to image
          ctx.fillStyle = "#F5F5E9";
          ctx.font = '36px "MaShanZheng-Regular"';
          // Set maximum width and vertical spacing
          let lineHeight = 36;
          let lineSpacing = 40;
          // Split text into lines
          const text = dataSource.Paragraph;
          const chunks = text.match(/.{1,8}[\。，\n]?/g);
          console.log(chunks);
          chunks.forEach((chunk, i) => {
            for (let ci = 0; ci < chunk.length; ci++) {
              const char = chunk.charAt(ci);
              ctx.fillText(char, 266 + lineSpacing * i, 360 + ci * 36 + i * 79);
            }
          });
          // place the canvas to a png buffer
          const buffer = canvas.toBuffer("image/png");
          // save the buffer as a file
          fs.writeFileSync(`./.tmp/${dataSource.Headline}.png`, buffer);
          // upload the created file to strapi
          const fileName = `${dataSource.Headline}.png`;
          const filePath = `./.tmp/${fileName}`
          const stats = fs.statSync(filePath)
          return strapi.plugins.upload.services.upload.upload({
            populate: '*',
            data: {}, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.
            files: {
              path: filePath,
              name: fileName,
              type: mime.lookup(filePath), // mime type of the file
              size: stats.size,
            },
          });



        })
        .then((response) => {
          // console.log("File uploaded succesfully", response);
          const cardId = dataSource.id
          const fileId = response[0].id;
          const fileUrl = response[0].url
          return strapi.query("api::card.card").update({
            where: { id: cardId },
            data: {
              Poster: fileId,
              PosterUrl: public_url + fileUrl,
              ImageUrl: imageUrl
            }
          })

        })
        .catch((err) => {
          console.error(err);
        });

    }
  },
};
