"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

interface LottieAnimationProps {
  path: string;
}

export default function LottieAnimation({ path }: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(path)
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error fetching animation:", error));
  }, [path]);

  if (!animationData) {
    return <div>Loading animation...</div>;
  }

  return <Lottie animationData={animationData} loop={true} />;
}
