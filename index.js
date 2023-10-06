const axios = require("axios");
const { createWriteStream } = require("fs");
const { execSync } = require("child_process");

const removeOldJar = () => {
  if (require("fs").existsSync("./Lavalink.jar")) {
    require("fs").unlinkSync("./Lavalink.jar");
  }
};

const downloadLatestLavalink = async () => {
  const lavalinkReleases =
    "https://api.github.com/repos/lavalink-devs/Lavalink/releases";
  const options = {
    headers: {
      "User-Agent": "Node.js",
    },
  };

  try {
    const response = await axios.get(lavalinkReleases, options);
    const releases = response.data;
    const latestRelease = releases.find((release) => release.prerelease);

    if (latestRelease) {
      const downloadUrl = latestRelease.assets.find(
        (asset) => asset.name === "Lavalink.jar"
      ).browser_download_url;
      const writer = createWriteStream("Lavalink.jar");
      const response = await axios.get(downloadUrl, { responseType: "stream" });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } else {
      throw new Error("No Lavalink release found.");
    }
  } catch (error) {
    throw error;
  }
};

const start = async () => {
  removeOldJar();
  try {
    await downloadLatestLavalink();
    execSync("java -jar Lavalink.jar", { stdio: "inherit" });
  } catch (error) {
    console.error("Error downloading or running Lavalink:", error);
  }
};

start();
