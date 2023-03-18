// use the signAccessJwt export from `livepeer` in Node.JS
import { signAccessJwt } from 'livepeer/crypto';
 
const accessControlPrivateKey =
  "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JR0hBZ0VBTUJNR0J5cUdTTTQ5QWdFR0NDcUdTTTQ5QXdFSEJHMHdhd0lCQVFRZ3NqWC9KWkRmeEdBR0dCY08KSzU1K1BmRWpMbHlyL1pGWkFGSUlXR1RoOWQraFJBTkNBQVFJb2hWWEFNWldXeStpMUZQUTZuSEVwbVp0S0YrWgo4TkdweWZWZVN4M0dCU0dDVlYzUThuckJxWWJwVWZLbFZnQXE1QTZzUVVROE5IbS9SNXFUajJJbAotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tCg==";
const accessControlPublicKey =
  "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFQ0tJVlZ3REdWbHN2b3RSVDBPcHh4S1ptYlNoZgptZkRScWNuMVhrc2R4Z1VoZ2xWZDBQSjZ3YW1HNlZIeXBWWUFLdVFPckVGRVBEUjV2MGVhazQ5aUpRPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==";
 
const jwtHandler = async (req, res) => {

  try {
    const method = req.method;

    if (method === "POST") {
      if (!accessControlPrivateKey || !accessControlPublicKey) {
        return res
          .status(500)
          .json({ message: "No private/public key configured." });
      }

      const { playbackId, secret } = req.body;

      if (!playbackId || !secret) {
        return res.status(400).json({ message: "Missing data in body." });
      }

      if (secret !== "supersecretkey") {
        return res.status(401).json({ message: "Incorrect secret." });
      }

      const token = await signAccessJwt({
        privateKey: accessControlPrivateKey,
        publicKey: accessControlPublicKey,
        issuer: "https://docs.livepeer.org",
        playbackId,
        expiration: "1h",
        custom: {
          userId: "user-id-1",
        },
      });

      return res.status(200).json({
        token,
      });
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Error" });
  }
};
 
export default jwtHandler;