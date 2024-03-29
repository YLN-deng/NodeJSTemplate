import * as shelljs from "shelljs";

shelljs.cp("-R" , "src/public" , "dist");
shelljs.cp("-R" , "views" , "dist");