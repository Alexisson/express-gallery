import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

const PORT = process.env.PORT || 5000;

const handleError = (err, res) => {
  res.status(500).contentType("text/plain").end("Error");
};

const upload = multer({
  dest: "/upload",
});

const app = express();
app
  .use(
    "/upload",
    express.static(path.join(import.meta.url.substring(8), "../upload"))
  )
  .use("/gallery", (r) => {
    const images = [];
    fs.readdirSync(
      path.join(import.meta.url.substring(8), "../upload")
    ).forEach((file) => {
      images.push(file);
    });
    r.res.send(images);
  })
  .get(
    "/",
    express.static(path.join(import.meta.url.substring(8), "../public"))
  )
  .post("/upload", upload.single("file"), (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(
      import.meta.url.substring(8),
      `../upload/${Math.floor(Date.now() / 1000).toString()}.${
        req.file.originalname.split(".")[1]
      }`
    );
    try {
      fs.rename(tempPath, targetPath, (err) => {
        if (err) return handleError(err, res);
        res.status(200).redirect("back");
      });
    } catch (e) {
      fs.unlink(tempPath, (err) => {
        if (err) return handleError(err, res);
        res.status(403).contentType("text/plain").end("Error on upload!");
      });
    }
  })
  .listen(PORT, () =>
    console.log(`Server is working on http://${os.hostname}:${PORT}`)
  );
