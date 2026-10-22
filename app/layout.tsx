export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>NqAI LLC - Live Voice+Text Interpreter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}
