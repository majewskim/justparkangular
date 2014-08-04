(function() {
    var app = angular.module("justpark", []);

    app.controller("calculonCtrl", function($log, millisecondsConverterService, rateService, priceCheckService) {
        //esxpose the scope
        var calc = this;

        /**
         * Calculates final parking cost
         * @return {[String]} [Final parking cost]
         */
        calc.calculate = function() {
            //get our rates
            var rates = rateService.getRates();
            //create Date objects from input fields
            var fromDate = new Date(calc.from),
                toDate = new Date(calc.to);
            //calculate the difference in miliseconds
            var differenceDate = toDate - fromDate;
            //convert milliseconds to hours,days,weeks
            millisecondsConverterService.convertIt(differenceDate);
            //get the converted values
            var convertedValues = millisecondsConverterService.getConverted();
            //first set the finalPrice in hourly rate
            var finalPrice = convertedValues.resultHours * rates.rateHourly;

            //if that price is bigger then a daily rate, use daily rate
            if (finalPrice > rates.rateDaily) {
                var days = Math.ceil(convertedValues.resultDays);

                //check if it the return is before 5am, if yes, don't count the last day
                if (days > 1 && toDate.getUTCHours() < 5) {
                    finalPrice = rates.rateDaily * (days - 1);
                } else if (days == 1 && toDate.getUTCHours() >=5) {
                    finalPrice = rates.rateDaily * (days + 1);
                } else {
                    finalPrice = rates.rateDaily * days;
                }
            }
            //if price is bigger then a weekly rate, use weekly rate
            if (finalPrice > rates.rateWeekly) {
                finalPrice = rates.rateWeekly * Math.ceil(convertedValues.resultWeeks);
            }
            //if price is bigger then a monthly rate, use monthly rate
            if (finalPrice > rates.rateMonthly) {
                finalPrice = rates.rateMonthly * Math.ceil(convertedValues.resultMonths);
            }

            //pass final price to the model
            calc.finalPrice = priceCheckService.checkPrice(finalPrice);
        };
    }).service("millisecondsConverterService", function() {
        //expose our scope
        var serviceScope = this;
        /**
         * Converts milliseconds into hours,days,weeks and months
         * @param  {[int]} differenceDate
         * @return {[object]} [returns object containing all converted values]
         */
        this.convertIt = function(differenceDate) {
            //this is where the magic happens
            var resultHours = (differenceDate / 1000) / 3600;
            var resultDays = resultHours / 24;
            var resultWeeks = resultDays / 7;
            var resultMonths = resultWeeks / 4.34812;

            serviceScope.convertedValues = {
                "resultHours": resultHours,
                "resultDays": resultDays,
                "resultWeeks": resultWeeks,
                "resultMonths": resultMonths
            };

        };
        /**
         * Returns converted values
         * @return {[object]} [object containing all converted values]
         */
        this.getConverted = function() {
            return serviceScope.convertedValues;
        };

    }).service("rateService", function() {
        //parking rates obj
        var rates = {
            rateHourly: 2,
            rateDaily: 5,
            rateWeekly: 20,
            rateMonthly: 70
        };
        /**
         * Returns object containing parking rates
         * @return {[object]}
         */
        this.getRates = function() {
            return rates;
        };
    }).service("priceCheckService", function() {
        this.checkPrice = function(finalPrice) {
            if (finalPrice < 0) {
                return "Look at him trying to park in the past! Sneaky sneaky";
            } else if (isNaN(finalPrice)) {
                return "I'm thinking, this is a wrong date mister";
            } else {
                //look at me being all unicodey :)
                return String.fromCharCode('163') + finalPrice;
            }
        };
    });

})();