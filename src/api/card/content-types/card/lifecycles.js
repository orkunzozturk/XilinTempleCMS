// lifecycles.js
const fs = require("fs");

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
      const { loadImage, createCanvas } = require("canvas");

      // Dimensions for the image
      const width = 378;
      const height = 662.438;

      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fill the rectangle with white
      ctx.fillStyle = "#a14124";
      ctx.fillRect(0, 0, width, height);
      ctx.fillText("hello world", width, height);

      // load the background image
      loadImage(dataSource.ImageUrl)
        .then((image) => {
          // draw the background image on the canvas
          ctx.drawImage(image, 0, 0, width, height);

          // add Headline to the image
          ctx.fillStyle = "white";
          ctx.font = "bold 48px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(dataSource.Headline, width / 2, height / 3);

          // Add Paragraph to image
          ctx.fillStyle = "white";
          ctx.font = "bold 48px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(dataSource.Paragraph, width / 2, height / 2);

          // place the canvas to a png buffer
          const buffer = canvas.toBuffer("image/png");
          // save the buffer as a file
          fs.writeFileSync(`./.tmp/${dataSource.Headline}.png`, buffer);
          // upload the created file to strapi
          const mime = require('mime-types'); //used to detect file's mime type
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
      const { loadImage, createCanvas } = require("canvas");
      const fs = require("fs");

      // Dimensions for the image
      const width = 378;
      const height = 662.438;

      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fill the rectangle with white
      ctx.fillStyle = "#a14124";
      ctx.fillRect(0, 0, width, height);
      ctx.fillText("hello world", width, height);

      // load the background image
      loadImage(dataSource.ImageUrl)
        .then((image) => {
          // draw the background image on the canvas
          ctx.drawImage(image, 0, 0, width, height);

          // add Headline to the image
          ctx.fillStyle = "white";
          ctx.font = "bold 48px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(dataSource.Headline, width / 2, height / 3);

          // Add Paragraph to image
          ctx.fillStyle = "white";
          ctx.font = "bold 48px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(dataSource.Paragraph, width / 2, height / 2);

          // place the canvas to a png buffer
          const buffer = canvas.toBuffer("image/png");
          // save the buffer as a file
          fs.writeFileSync(`./.tmp/${dataSource.Headline}.png`, buffer);
          // upload the created file to strapi
          const mime = require('mime-types'); //used to detect file's mime type
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
