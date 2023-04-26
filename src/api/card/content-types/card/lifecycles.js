// lifecycles.js
const fs = require("fs");
const { loadImage, registerFont, createCanvas } = require("canvas");
const mime = require('mime-types'); //used to detect file's mime type


const api_url = "http://127.0.0.1:1337";
module.exports = {

  async afterUpdate(event) {
    console.log("running after update");
    let dataSource = event.params.data;
    if (
      dataSource.Paragraph &&
      dataSource.Paragraph?.length > 0
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
      const ImageUrl = api_url + JSON.parse(JSON.stringify(imageResource)).url;
      dataSource.ImageUrl = ImageUrl;

      // create a canvas


      // register custom fonts
      registerFont('static/TsangerYuYangT W05.ttf', { family: 'TsangerYuYangTBold' })
      registerFont('static/TsangerYuYangT W01.ttf', { family: 'TsangerYuYangTThin' })
      registerFont('static/OpenSans-Light.ttf', { family: 'OpenSansLight' })
      registerFont('static/OpenSans-SemiBold.ttf', { family: 'OpenSansSemiBold' })
      // Dimensions for the image
      const width = 378;
      const height = 662.438;
      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      // draw white BG
      // Draw a rectangle with a white fill onto the canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // resize bg image based on aspect ratio
      const backgroundImage = await loadImage(dataSource.ImageUrl);
      const logo = await loadImage('static/xilinshuyuan.jpg');

      const imageAspectRatio = backgroundImage.width / backgroundImage.height;
      //get canvas aspect ratio, which is: 378/662.438=0.57
      const canvasAspectRatio = width / height;
      // Determine the aspect ratio of the image
      console.log("BG image aspect ratio is: " + imageAspectRatio + ", canvas aspect ratio is: " + canvasAspectRatio);
      // Calculate the scaled width and height of the image based on the canvas size and aspect ratio
      let scaledWidth, scaledHeight;
      if (imageAspectRatio > 1) {
        scaledHeight = height/1.5
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
        x = (width-scaledWidth)/2;
        // console.log("x focus is center");
      } else if (focusX == 1) {
        x = width-scaledWidth;
        // console.log("x focus is right");
      } else if (focusX == 0) {
        x= (width-scaledWidth) / 2
        // console.log("y focus is left");
      }

      if (focusY == 0.5) {
        y = (height-scaledHeight)/2;
        // console.log("y focus is center");
      } else if (focusY == 1) {
        y = height-scaledHeight;
        // console.log("y focus is bottom");
      } else if (focusY == 0) {
        y= 0
        // console.log("y focus is top");
      }


      // load the background image
      loadImage(dataSource.ImageUrl)
        .then((image) => {
          // draw the background image on the canvas
          ctx.drawImage(image,  x, y, scaledWidth ,scaledHeight);
          // add gradient
          // var grd = ctx.createLinearGradient(0, height-449, 0, height)
          var grd = ctx.createLinearGradient(0, 0, 0, height)


          // for(var t = 0; t <= 1; t += 0.05) {    // convert linear t to "easing" t:
          //     grd.addColorStop(t, "hsla(225, 3%, 100%, " + easeInOut(t) * 1 + ")");
          // }

          grd.addColorStop(0.54,"rgba(148, 150, 155, 0");
          grd.addColorStop(0.66,"#FFFFFF");
          ctx.fillStyle=grd;
          ctx.fillRect(0,0,canvas.width,canvas.height);

          // logo
          ctx.drawImage(logo,  151, 593, 77 , 77);

          // function easeInOut(t) {return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1}

          // get calendar elements
          const date = dataSource.publishedAt ? dataSource.publishedAt : dataSource.updatedAt
          const weekday = ["Sun.","Mon.","Tue.","Wed.","Thur.","Fri.","Sat."];
          const calendarMonth = ["01", "02","03","04","05","06","07","08","09","10","11","12"]
          const day = weekday[date.getDay()]
          const dayDate = date.getDate()
          const month = calendarMonth[date.getMonth()]
          const year = date.getFullYear()

          // add calendar elements
          //add Calendar BG
          ctx.fillStyle = "rgba(217, 217, 217, 0.5);";
          ctx.beginPath();
          ctx.roundRect(0, 34, 92, 92, [4])
          ctx.fill()
          // day number
          // TODO: Add fillstyle color to frontend
          ctx.fillStyle = "black";
          ctx.font = '56px "OpenSansSemiBold"';
          ctx.textAlign = "left";
          ctx.fillText(dayDate, width / 34, 80);
          // year and month
          ctx.fillStyle = "black";
          ctx.font = '20px "OpenSansLight"';
          ctx.textAlign = "left";
          ctx.fillText(`${year}-${month}`, width / 34, 80+20);
          // console.log("text height is" + (ctx.measureText(ctx.filltext).actualBoundingBoxAscent+ctx.measureText(ctx.filltext).actualBoundingBoxAscent));
          // Week Day
          ctx.fillStyle = "black";
          ctx.font = '20px "OpenSansSemiBold"';
          ctx.textAlign = "left";
          ctx.fillText(day, width / 34, 80+20+20);

          // add Headline to the image
          ctx.fillStyle = "black";
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          ctx.font = '36px "TsangerYuYangTBold"';
          ctx.textAlign = "center";
          ctx.fillText("日签", width / 2, 493);

          // Add Paragraph to image
          ctx.fillStyle = "black";
          ctx.font = 'normal 20px "TsangerYuYangTThin"';
          ctx.textAlign = "center";
          // ctx.fillText(dataSource.Paragraph, width / 2, 534);

          // text wrapping:
          function wrapText (context, text, x, y, maxWidth, lineHeight) {

            var words = text.split(' '),
                line = '',
                lineCount = 0,
                i,
                test,
                metrics;

            for (i = 0; i < words.length; i++) {
                test = words[i];
                metrics = context.measureText(test);
                while (metrics.width > maxWidth) {
                    // Determine how much of the word will fit
                    test = test.substring(0, test.length - 1);
                    metrics = context.measureText(test);
                }
                if (words[i] != test) {
                    words.splice(i + 1, 0,  words[i].substr(test.length))
                    words[i] = test;
                }

                test = line + words[i] + ' ';
                metrics = context.measureText(test);

                if (metrics.width > maxWidth && i > 0) {
                    context.fillText(line, x, y);
                    line = words[i] + ' ';
                    y += lineHeight;
                    lineCount++;
                }
                else {
                    line = test;
                }
            }

            context.fillText(line, x, y);

        }
          wrapText(ctx, dataSource.Paragraph, width / 2, 534, 300, 25);

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
            data:{}, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.
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
            where: {id:cardId},
            data:{
              Poster: fileId,
              PosterUrl: api_url + fileUrl
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
      dataSource.Paragraph &&
      dataSource.Paragraph?.length > 0
    ) {

      // get the image url associated with post:
      const imageResourceUrl = dataSource.Image.url
      console.log("image resource: " + imageResourceUrl);
      // // convert the relative path as an absolute path to the ImageUrl field of the card content-type:
      const imageUrl = api_url + imageResourceUrl
      dataSource.ImageUrl = imageUrl;
      console.log("Data image source link: " + dataSource.ImageUrl);

      // create a canvas
      // register custom fonts
      registerFont('static/TsangerYuYangT W05.ttf', { family: 'TsangerYuYangTBold' })
      registerFont('static/TsangerYuYangT W01.ttf', { family: 'TsangerYuYangTThin' })
      registerFont('static/OpenSans-Light.ttf', { family: 'OpenSansLight' })
      registerFont('static/OpenSans-SemiBold.ttf', { family: 'OpenSansSemiBold' })
      // Dimensions for the image
      const width = 378;
      const height = 662.438;

      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const backgroundImage = await loadImage(dataSource.ImageUrl);
      const logo = await loadImage('static/xilinshuyuan.jpg');
      const imageAspectRatio = backgroundImage.width / backgroundImage.height;
      const canvasAspectRatio = width / height;
      // Determine the aspect ratio of the image
      console.log("BG image aspect ratio is: " + imageAspectRatio + ", canvas aspect ratio is: " + canvasAspectRatio);
      // Calculate the scaled width and height of the image based on the canvas size and aspect ratio
      let scaledWidth, scaledHeight;
      if (imageAspectRatio > 1) {
        scaledHeight = height/1.5
        scaledWidth = scaledHeight * imageAspectRatio;
      } else {
        scaledWidth = width
        scaledHeight = scaledWidth / imageAspectRatio;
      }
      // Set the focus position for the background image (values between 0 and 1)
      const focusX = 0.5; // 0 = left, 0.5 = center, 1 = right
      const focusY = 0.5; // 0 = top, 0.5 = center, 1 = bottom
      // Calculate the position of the top-left corner of the image based on the focus position
      let x = 0, y = 0;

      if (focusX == 0.5) {
        x = (width-scaledWidth)/2;
        console.log("x focus is center");
      } else if (focusX == 1) {
        x = width-scaledWidth;
        console.log("x focus is right");
      } else if (focusX == 0) {
        x= (width-scaledWidth) / 2
        console.log("y focus is left");
      }

      if (focusY == 0.5) {
        y = (height-scaledHeight)/2;
        console.log("y focus is center");
      } else if (focusY == 1) {
        y = height-scaledHeight;
        console.log("y focus is right");
      } else if (focusY == 0) {
        y= (height-scaledHeight) / 2
        console.log("y focus is left");
      }
      // load the background image
      loadImage(dataSource.ImageUrl)
        .then((image) => {
          // draw the background image on the canvas
          ctx.drawImage(image,  x, y, scaledWidth ,scaledHeight);
          // add gradient
          // var grd = ctx.createLinearGradient(0, height-449, 0, height)
          var grd = ctx.createLinearGradient(0, 0, 0, height)


          // for(var t = 0; t <= 1; t += 0.05) {    // convert linear t to "easing" t:
          //     grd.addColorStop(t, "hsla(225, 3%, 100%, " + easeInOut(t) * 1 + ")");
          // }

          grd.addColorStop(0.54,"rgba(148, 150, 155, 0");
          grd.addColorStop(0.66,"#FFFFFF");
          ctx.fillStyle=grd;
          ctx.fillRect(0,0,canvas.width,canvas.height);

          // logo
          ctx.drawImage(logo,  151, 593, 77 , 77);

          // function easeInOut(t) {return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1}

          // get calendar elements
          const date = dataSource.publishedAt ? dataSource.publishedAt : new Date()
          console.log(date.getDate());
          const weekday = ["Sun.","Mon.","Tue.","Wed.","Thur.","Fri.","Sat."];
          const calendarMonth = ["01", "02","03","04","05","06","07","08","09","10","11","12"]
          const day = weekday[date.getDay()]
          const dayDate = date.getDate()
          const month = calendarMonth[date.getMonth()]
          const year = date.getFullYear()

          // add calendar elements
          //add Calendar BG
          ctx.fillStyle = "rgba(217, 217, 217, 0.5);";
          ctx.beginPath();
          ctx.roundRect(0, 34, 92, 92, [4])
          ctx.fill()
          // day number
          ctx.fillStyle = "black";
          ctx.font = '56px "OpenSansSemiBold"';
          ctx.textAlign = "left";
          ctx.fillText(dayDate, width / 34, 80);
          // year and month
          ctx.fillStyle = "black";
          ctx.font = '20px "OpenSansLight"';
          ctx.textAlign = "left";
          ctx.fillText(`${year}-${month}`, width / 34, 80+20);
          // console.log("text height is" + (ctx.measureText(ctx.filltext).actualBoundingBoxAscent+ctx.measureText(ctx.filltext).actualBoundingBoxAscent));
          // Week Day
          ctx.fillStyle = "black";
          ctx.font = '20px "OpenSansSemiBold"';
          ctx.textAlign = "left";
          ctx.fillText(day, width / 34, 80+20+20);

          // add Headline to the image
          ctx.fillStyle = "black";
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          ctx.font = '36px "TsangerYuYangTBold"';
          ctx.textAlign = "center";
          ctx.fillText("日签", width / 2, 493);

          // Add Paragraph to image
          ctx.fillStyle = "black";
          ctx.font = 'normal 20px "TsangerYuYangTThin"';
          ctx.textAlign = "center";
          // ctx.fillText(dataSource.Paragraph, width / 2, 534);

          // text wrapping:
          function wrapText (context, text, x, y, maxWidth, lineHeight) {

            var words = text.split(' '),
                line = '',
                lineCount = 0,
                i,
                test,
                metrics;

            for (i = 0; i < words.length; i++) {
                test = words[i];
                metrics = context.measureText(test);
                while (metrics.width > maxWidth) {
                    // Determine how much of the word will fit
                    test = test.substring(0, test.length - 1);
                    metrics = context.measureText(test);
                }
                if (words[i] != test) {
                    words.splice(i + 1, 0,  words[i].substr(test.length))
                    words[i] = test;
                }

                test = line + words[i] + ' ';
                metrics = context.measureText(test);

                if (metrics.width > maxWidth && i > 0) {
                    context.fillText(line, x, y);
                    line = words[i] + ' ';
                    y += lineHeight;
                    lineCount++;
                }
                else {
                    line = test;
                }
            }

            context.fillText(line, x, y);

        }
          wrapText(ctx, dataSource.Paragraph, width / 2, 534, 300, 25);

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
            data:{}, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.
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
          where: {id:cardId},
          data:{
            Poster: fileId,
            PosterUrl: api_url + fileUrl,
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
