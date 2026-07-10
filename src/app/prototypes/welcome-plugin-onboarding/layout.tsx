import { prototypeMetadata } from "../prototype-metadata";
import meta from "./meta.json";

export const metadata = prototypeMetadata(meta);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
