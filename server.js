const express = require("express");
const Parser = require("rss-parser");
const path = require("path");

const parser = new Parser();

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/incidents", async (req, res) => {
  try {
    const fhpSignalCodes = {
      S0: "Armed and/or caution",
      S1: "DUI - Vehicle",
      S1B: "BUI - Boat",
      S1J: "DUI - Juvenile",
      S2: "Drunk pedestrian",
      S3: "Hit and run",
      S3B: "Hit and run - Boat",
      S3I: "Hit and run w/injuries",
      S3IR: "Hit and run w/injuries and roadblock",
      S3P: "Hit and run - Patrol vehicle",
      S3R: "Hit and run w/roadblock",
      S4: "Vehicle crash",
      S4A: "Aircraft crash - Land",
      S4AW: "Aircraft crash - Water",
      S4I: "Vehicle crash w/injuries",
      S4IR: "Vehicle crash w/injuries and roadblock",
      S4P: "Patrol car crash",
      S4R: "Vehicle crash w/roadblock",
      S5: "Murder",
      S6: "Escaped prisoner",
      S7: "Fatality",
      S7B: "Boating crash w/fatality",
      S7P: "Possible fatality",
      S8: "Missing person",
      S9: "Lost/stolen tag",
      S10: "Stolen vehicle",
      S10A: "Attempted auto theft",
      S10B: "Stolen boat",
      S10J: "Car jacking",
      S10R: "Stolen vehicle recovery",
      S11: "Abandoned vehicle",
      S11B: "Abandoned boat",
      S11R: "Abandoned vehicle w/roadblock",
      S12: "Reckless vehicle",
      S12B: "Reckless boat",
      S13: "Suspicious (specify)",
      S13B: "Suspicious boat",
      S13P: "Suspicious person",
      S13S: "Suspicious package",
      S13V: "Suspicious vehicle",
      S14: "Information",
      S14A: "Travel advisory",
      S14I: "Intelligence",
      S14S: "Sealed by court order",
      S14T: "Information tip line",
      S15: "Special detail",
      S15C: "Special detail (criminal interview)",
      S15NC: "Special detail (noncriminal interview)",
      S15M: "Special detail (move over law)",
      S15P: "Special detail (polygraph examination)",
      S16: "Obstruction on highway",
      S16C: "Construction",
      S16D: "Roadway debris/object",
      S16F: "Roadway closed due to fog",
      S16I: "Roadway closed due to ice",
      S16O: "Roadway closed due to other conditions",
      S16S: "Roadway closed due to smoke",
      S16T: "Traffic light out",
      S16W: "Roadway closed due to water",
      S18: "Felony",
      S19: "Misdemeanor",
      S20: "Mentally ill person",
      S21: "Burglary",
      S21C: "Burglary to conveyance",
      S22: "Disturbance/disorder",
      S22D: "Domestic violence",
      S22H: "Highway violence/road rage",
      S22I: "Injunction",
      S23: "Pedestrian/hitchhiker",
      S24: "Robbery / Toll evasion",
      S24S: "Strong arm robbery",
      S25: "Fire (specify)",
      S25A: "Fire alarm",
      S25B: "Fire - Boat",
      S25C: "Campfire",
      S25D: "Fire drill",
      S25P: "Fire - Prescribed burn",
      S25F: "Fire - Brush/forrest",
      S25I: "Fire - Illegal burn",
      S25S: "Fire - Structure",
      S25V: "Fire - Vehicle",
      S27: "Theft/larceny",
      S28: "Malicious mischief/vandalism",
      S29A: "At risk vessel",
      S30: "Shooting",
      S31: "Kidnapping",
      S32: "Assault",
      S32P: "Threat to public official",
      S33: "Battery",
      S34: "Sex offense (specify)",
      S35: "Destruction of state property (specify)",
      S36: "Trespassing",
      S37: "Drug/contraband case",
      S38: "Police roadblock",
      S38X: "Police roadblock - Simulated",
      S39C: "Close gate/door (specify)",
      S39O: "Open gate/door (specify)",
      S40: "Callbox request",
      S40M: "Callbox request - Medical",
      S40P: "Callbox request - Police",
      S40S: "Callbox request - Service call",
      S41: "Sick/injured person",
      S41A: "Possible AIDS",
      S42: "Assist other agency (specify)",
      S42F: "Assist other troop with fatality",
      S42N: "Notification of next of kin",
      S43: "Assist public",
      S44: "Suicide",
      S45: "Officer down",
      S46: "Relay (specify)",
      S47: "Bomb threat",
      S47D: "Bomb disposal",
      S47N: "Secondary radiological screening",
      S47R: "Request for EOD",
      S48: "Explosion",
      S49: "Prowler/stalker",
      S51: "Juvenile offense",
      S51A: "Juvenile alcohol offense",
      S51T: "Juvenile tobacco offense",
      S52: "Child abuse/molestation",
      S53: "Smuggling (specify)",
      S53A: "Illegal aliens",
      S53B: "Alcoholic beverages",
      S53C: "Cigarettes",
      S53E: "Endangered/threatened species",
      S53F: "Food or other illegal AG product",
      S53M: "Marine species (protected)",
      S53N: "Narcotics",
      S53P: "Protected wildlife",
      S53W: "Weapons",
      S54: "Parking complaint",
      S55: "Incident (specify)",
      S55A: "Amber Alert (endangered child)",
      S55B: "Blue Alert",
      S55D: "Purple Alert",
      S55P: "Recovered/found property",
      S55R: "Rock throwing",
      S55S: "Silver Alert (endangered adult)",
      S55T: "Telephone harassment",
      S56: "Animal call",
      S57: "Impersonating an officer",
      S58: "Fraud (specify)",
      S59: "Injuries",
      S60A: "Wildlife attack",
      S60E: "Wildlife escape",
      S61: "Past criminal history",
      S61F: "Felony past",
      S61M: "Misdemeanor past",
      S61V: "Violent past",
      S70: "Gambling",
      S71: "Prostitution",
      S72: "Engage secured (communications)",
      S73: "Disengage secured (communications)",
      S74: "Informant",
      S75P: "Person/swimmer/diver emergency",
      S76: "Disabled vehicle",
      S76B: "Disabled boat",
      S76P: "Disabled patrol car",
      S76R: "Disabled vehicle in roadway",
      S77: "Weapons violation",
      S78: "Bribery",
      S79: "All terrain vehicle (ATV) violation",
      S80A: "Additional patrol requested",
      S80D: "Open door complaint",
      S80G: "Security check (grounds)",
      S80L: "Security check (driver's license office only)",
      S80P: "Security check (state parks)",
      S80R: "Security check (ranges)",
      S80S: "Security check (structure)",
      S80V: "Security check (vehicle)",
      S83: "Operation Safe Place call",
      S90: "Alcohol violation (specify)",
      S91L: "Littering",
      S99: "Possible computer hit - unconfirmed",
      S99C: "Confirmed computer hit",
    };

    const feed = await parser.parseURL(
      "https://trafficincidents.flhsmv.gov/SmartWebClient/CADrss.aspx",
    );

    let incidents = [];

    // Loop through each incident from feed
    feed.items.forEach((item) => {
      // Split each incident by <BR> tag
      let content = item.content.split("<BR>");

      // Strip each item in the parsed content list
      content.forEach((cont, index) => {
        let newCont = cont.substring(cont.indexOf(":") + 1).trim();
        content[index] = newCont !== "" ? newCont : null;
      });

      // Declare content array with values from incident
      let contentArray = {
        cadDate: content[0],
        dispatchedTime: content[1],
        arrivedTime: content[2],
        incidentType: content[3],
        incidentName: fhpSignalCodes[content[3]],
        location: content[4],
        district: content[5],
        city: content[6],
        county: content[7],
        latitude: content[8],
        longitude: content[9],
        remarks: content[10],
      };

      incidents.push({
        title: item.title.substring(item.title.indexOf(":") + 1).trim(),
        ...contentArray,
      });
    });

    res.send(incidents);
  } catch (error) {
    console.error("Failed to fetch incidents: ", error);
    res
      .status(502)
      .json({ success: false, message: "Failed to fetch incidents" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
