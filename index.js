import fs from "fs";
import fetch from "node-fetch";
import parser from "xml2json";

const FEED_URL = "https://eneaxharja.com/rss-feed.xml";
const TAG_OPEN = `<!-- FEED-START -->`;
const TAG_CLOSE = `<!-- FEED-END -->`;

const fetchPosts = async () => {
  const posts = await fetch(FEED_URL);
  const postsText = await posts.text();
  const postsJSON = parser.toJson(postsText);
  const newChunk = JSON.parse(postsJSON).rss.channel.item.slice(0, 5);
  return newChunk.map(({ title, link }) => `- [${title}](${link})`).join("\n");
};

async function main() {
  const readme = fs.readFileSync("./README.md", "utf8");
  const indexBefore = readme.indexOf(TAG_OPEN) + TAG_OPEN.length;
  const indexAfter = readme.indexOf(TAG_CLOSE);
  const readmeContentChunkBreakBefore = readme.substring(0, indexBefore);
  const readmeContentChunkBreakAfter = readme.substring(indexAfter);

  const posts = await fetchPosts();

  const readmeNew = `
${readmeContentChunkBreakBefore}
${posts}
${readmeContentChunkBreakAfter}
`;

  fs.writeFileSync("./README.md", readmeNew.trim());
}

try {
  main();
} catch (error) {
  console.error(error);
}
