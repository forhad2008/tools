export type BrushCategory =
  | 'inking'
  | 'textures'
  | 'painting'
  | 'lettering'
  | 'decorative'
  | 'vfx';

export type AdobeTarget = 'photoshop' | 'illustrator' | 'both';
export type IllustratorBrushType = 'art' | 'scatter' | 'pattern' | 'calligraphic' | 'bristle';

export interface BrushDynamics {
  size: number;
  minSize: number;
  opacity: number;
  flow: number;
  hardness: number;
  spacing: number;
  angle: number;
  angleJitter: number;
  sizeJitter: number;
  scatter: number;
  scatterCount: number;
  pressureEnabled: boolean;
  smoothing: number;
  colorJitter: number;
  blendMode: 'source-over' | 'multiply' | 'screen' | 'overlay' | 'lighter';
}

export interface BrushItem {
  id: string;
  name: string;
  category: BrushCategory;
  tagline: string;
  description: string;
  targetSoftware: AdobeTarget;
  illustratorType: IllustratorBrushType;
  defaultDynamics: BrushDynamics;
  features: string[];
  photoshopSpecs: {
    tipShape: string;
    transferMode: string;
    dualBrush?: string;
    smoothing: string;
    recommendedUse: string;
    jsxPresetLine: string;
  };
  illustratorSpecs: {
    brushKind: string;
    strokeScaling: 'proportional' | 'stretch' | 'tile';
    fidelity: string;
    colorization: 'None' | 'Tints' | 'Tints and Shades' | 'Hue Shift';
    recommendedUse: string;
    svgDefinition: string;
  };
  renderEngine: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    prevX: number,
    prevY: number,
    pressure: number,
    dynamics: BrushDynamics,
    color: string,
    time: number
  ) => void;
  drawThumbnail: (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => void;
}
