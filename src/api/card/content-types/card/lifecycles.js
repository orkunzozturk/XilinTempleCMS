
module.exports = {
  async afterUpdate(event) {
    const { data } = event.params;
    if (
      event.params.data.Paragraph &&
      event.params.data.Paragraph?.length > 0
    ) {
      // console.log("NEW CONTENT CREATED" + event.params.data.Paragraph);

      // another trial
      const { createCanvas } = require("canvas");
      const fs = require("fs");

      // Dimensions for the image
      const width = 1200;
      const height = 627;

      // Instantiate the canvas object
      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");

      // Fill the rectangle with purple
      context.fillStyle = "#764abc";
      context.fillRect(0, 0, width, height);

      // Write the image to file
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync("./image.png", buffer);


    }
  },
};

// ADD same lifecycle hook to update content
