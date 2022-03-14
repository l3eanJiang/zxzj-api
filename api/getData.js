import main from "../index.js";
export default async function handler (req, res) {
  let list = await main(0)
  res.json(list)
}