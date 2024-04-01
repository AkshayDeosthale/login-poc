import React from "react";

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <main className="">{children}</main>;
};

export default RootLayout;
