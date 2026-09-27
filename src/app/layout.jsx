import "./globals.css";

export const metadata = {
  title: "Cognitive Graph • Web Remote Screen",
  description: "Interactive research knowledge graph, AI synthesis, and memory palace remote dashboard for Google Chrome.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
