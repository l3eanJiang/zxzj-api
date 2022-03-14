import { main } from "../index";
export default function handler (req, res) {
  res.send(main(0))
}