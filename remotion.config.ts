import { Config } from "@remotion/cli/config";

// Configuration for Zero-Local-Compute Autonomous Video Production Studio
// Default output settings for 60fps high fidelity rendering
Config.setVideoImageFormat("jpeg");
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setCrf(18);
Config.setOverwriteOutput(true);
