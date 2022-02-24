const path = require("path");
const fs = require("fs");
const customError = require("./customError");
const { nanoid } = require("nanoid");

const fileSizeLimit = 1000 * 1000;
const uploadsFolder = path.resolve(__dirname, "..", "public", "uploads");

const handleImages = async ({
  imagesToAdd = [],
  productID,
  imagesToRemove = [],
  currentImages,
}) => {
  const imageHandling = {};

  if (imagesToAdd.length > 0) {
    var { imageUploadResults, currentImages } = await saveImages(
      imagesToAdd,
      currentImages,
      productID
    );
    imageHandling.imageUploadResults = imageUploadResults;
  }

  if (imagesToRemove.length > 0) {
    var { imageRemoveResults, currentImages } = await removeImages(
      imagesToRemove,
      currentImages
    );
    imageHandling.imageRemoveResults = imageRemoveResults;
  }

  return { imageHandling, currentImages };
};

const saveImages = async (arrayOfImages, currentImages, productID) => {
  // check if file is an image, and under the size limit
  var { validatedImages, failedImages } = await validateImages(arrayOfImages);
  // for images that pass validation...
  if (validatedImages) {
    // ... rename them ...
    validatedImages = await renameImages(validatedImages, productID);
    // ... and write them to file.
    currentImages.push(...validatedImages.map((image) => image.newName));
  }
  const imageUploadResults = {};
  imageUploadResults.failed = failedImages;
  imageUploadResults.success = await writeImagesToFile(validatedImages);
  return { imageUploadResults, currentImages };
};

const validateImages = async (arrayOfImages) => {
  const validatedImages = [];
  const failedImages = [];
  arrayOfImages.forEach((image) => {
    // check if it's an image
    if (!image.mimetype.startsWith("image")) {
      failedImages.push({
        image: image.originalname,
        errorCause: "Please only upload image files.",
      });
      // check if it's under the file size limit
    } else if (image.size > fileSizeLimit) {
      failedImages.push({
        image: image.originalname,
        errorCause: `File over limit. (File: ${image.size}, limit: ${fileSizeLimit} bytes)`,
      });
    } else {
      validatedImages.push(image);
    }
  });
  return { validatedImages, failedImages };
};

const renameImages = async (arrayOfImages, productID) => {
  if (!arrayOfImages) return;

  for await (image of arrayOfImages) {
    image.newName = `${productID}_${nanoid()}.jpg`;
  }

  return arrayOfImages;
};

const writeImagesToFile = async (arrayOfImages) => {
  const uploadedImages = [];
  for await (image of arrayOfImages) {
    const filePath = `${uploadsFolder}\\${image.newName}`;
    await fs.writeFile(filePath, image.buffer, function (err) {
      if (err) {
        console.log(err);
        throw new customError("Please try again.", 500);
      }
    });
    uploadedImages.push({
      newName: image.newName,
      originalName: image.originalname,
    });
  }
  return uploadedImages;
};

const removeImages = (imagesToRemove = [], currentImages) => {
  const imageRemoveResults = { success: [], failed: [] };

  imagesToRemove.forEach((image) => {
    const index = currentImages.indexOf(image);
    // if this image is present in the array from the database...
    if (index > -1) {
      // ...remove from both disk and database.
      deleteImage(image);
      currentImages.splice(index, 1);
      imageRemoveResults.success.push(image);
    } else {
      imageRemoveResults.failed.push(image);
    }
  });
  return { imageRemoveResults, currentImages };
};

const deleteImage = async (fileName) => {
  const pathToFile = path.resolve(uploadsFolder, fileName);
  if (fs.existsSync(pathToFile)) {
    fs.unlinkSync(pathToFile);
  }
};

module.exports = {
  deleteImage,
  handleImages,
};
