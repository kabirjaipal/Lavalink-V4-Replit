const axios = require("axios");
const { createWriteStream } = require("fs");
const { execSync } = require("child_process");

const removeOldJar = () => {
  if (require("fs").existsSync("./Lavalink.jar")) {
    require("fs").unlinkSync("./Lavalink.jar");
  }
};

// Function to format bytes into a human-readable string
const formatBytes = (bytes) => {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
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

      const response = await axios.get(downloadUrl, { responseType: "stream" });

      const totalSize = parseInt(response.headers["content-length"], 10);
      let downloadedSize = 0;

      const writer = createWriteStream("Lavalink.jar");
      response.data.on("data", (chunk) => {
        downloadedSize += chunk.length;
        const percent = (downloadedSize / totalSize) * 100;

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(
          `Downloading... ${formatBytes(downloadedSize)} / ${formatBytes(
            totalSize
          )} (${percent.toFixed(2)}%)`
        );
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          process.stdout.write("\n"); // Move to the next line
          resolve();
        });
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
    console.log("Download complete!");
    execSync("java -jar Lavalink.jar", { stdio: "inherit" });
  } catch (error) {
    console.error("Error downloading or running Lavalink:", error);
  }
};

start();
