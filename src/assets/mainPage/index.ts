import type { StaticImageData } from "next/image";
import food1 from "./food_1.jpg";
import food2 from "./food_2.jpg";
import food3 from "./food_3.jpg";
import food4 from "./food_4.jpg";
import food5 from "./food_5.jpg";
import table1 from "./table_1.jpg";

/** Food photography for the courses carousel (5 slides). */
export const MAIN_PAGE_COURSE_IMAGES: StaticImageData[] = [
  food1,
  food2,
  food3,
  food4,
  food5,
];

/** Table imagery for the stacked gallery; duplicate entries are intentional when only one source file exists. */
export const MAIN_PAGE_TABLE_IMAGES: StaticImageData[] = [
  table1,
  table1,
  table1,
  table1,
  table1,
];
