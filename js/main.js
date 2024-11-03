import { factories } from "./factory.js";

factories.makePresetFactory(0);
factories.makePresetFactory(1);//makes 2 factories

factories.setPresetFactoryValues(0, 1);//sets factory 0 to type 1

console.log(factories.getProduction(0));//expected value is 10

console.log(factories);//logs factories

factories.makePresetFactory(2);
//makes a factory from a type that does not exist, logs error as expected
