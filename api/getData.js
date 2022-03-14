import { main } from "../index";
export default function handler (req, res) {
  res.json(main(0))
}