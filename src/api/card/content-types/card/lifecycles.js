// const { resourceLimits } = require("worker_threads");
// lifecycles.js
const { FormData } = require("formdata-node");
const fetch = require("node-fetch");

const api_url = "http://127.0.0.1:1337";
module.exports = {
  async afterUpdate(event) {
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

          // place the canvas to a JPEG buffer
          const buffer = canvas.toBuffer("image/jpeg");

          // save the buffer as a file
          fs.writeFileSync("./poster.jpg", buffer);
        })
        .catch((err) => {
          console.error(err);
        });


        const mime = require('mime-types'); //used to detect file's mime type
        const fileName = 'poster.jpg';
        const filePath = `./${fileName}`
        const stats = fs.statSync(filePath)
        await strapi.plugins.upload.services.upload.upload({
          data:{}, //mandatory declare the data(can be empty), otherwise it will give you an undefined error.
          files: {
          path: './poster.jpg',
          name: 'poster1.jpg',
          type: mime.lookup(filePath), // mime type of the file
          size: stats.size,
        },
      });

      // const useentity = await strapi.entityService.create("plugin::upload.file", {
      //   data:{},
      //   files: {
      //     path: './poster.jpg',
      //     name: 'poster.jpg',
      //     type: mime.lookup(filePath), // mime type of the file
      //     size: stats.size,
      //   }
      //   }
      // );




    }
  },
};

// ADD same lifecycle hook to newly created content
