import "./styles.css";
import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const monthInWord = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const dayInWord = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const countryInfo = {
  PH: { name: "Philippines", capital: "Asia/Manila" },
  US: { name: "United States", capital: "America/New_York" },
  GB: { name: "United Kingdom", capital: "Europe/London" }
};

const holidayApiKey = process.env.HOLIDAY_API_KEY;
const DateContext = React.createContext();

const Header = (props) => {
  const { user, holidayToday } = props;
  let greeting = user ? `Welcome, ${user}!` : `Welcome!`;
  let isHoliday = false;
  try {
    isHoliday = Object.keys(holidayToday).length !== 0;
    greeting += isHoliday ? ` Today is ${holidayToday[0].name}!` : ``;
  } catch {}
  return (
    <div>
      <div className="header-main">
        <div className="website-name">HolidayList</div>
        {!user && (
          <div>
            <Button
              id="login"
              value="login"
              label="Login"
              onClick={() => {
                props.history.push({
                  pathname: "/login"
                });
              }}
              className="login-btn"
            />
          </div>
        )}
        {user && (
          <div>
            <Button
              id="signOut"
              value="signout"
              label="Sign out"
              onClick={() => {
                props.history.push({
                  pathname: "/login",
                  state: { action: "sign out" }
                });
              }}
              className="login-btn"
            />
          </div>
        )}
      </div>
      <div className="greeting">{isHoliday && <div>{greeting}</div>}</div>
    </div>
  );
};

const SettingsInfo = (props) => {
  const { user, date, country, onClick } = props;
  const dateInWord = new Date(date).toDateString();
  return (
    <div className="settings-info">
      {user && <div className="text">{user}</div>}
      {!user && <div className="text">Anonymous</div>}
      <div className="separation">|</div>
      <div className="text">{dateInWord}</div>
      <div className="separation">|</div>
      {!user && <div className="text">{countryInfo[country].name}</div>}
      {user && (
        <div className="dropdown">
          <Button
            id={country}
            value={country}
            label={countryInfo[country].name}
            className="dropbtn"
          />
          <ListOtherCountries country={country} onClick={onClick} />
        </div>
      )}
    </div>
  );
};

const Button = (props) => {
  const { id, value, label, onClick, className } = props;
  return (
    <div>
      <button className={className} id={id} value={value} onClick={onClick}>
        {label}
      </button>
    </div>
  );
};

const ListOtherCountries = (props) => {
  const { country, onClick } = props;
  const others = [];
  Object.keys(countryInfo).forEach(function (code) {
    if (code !== country) {
      const otherCountry = Object.assign({}, countryInfo[code]);
      otherCountry.code = code;
      others.push(otherCountry);
    }
  });
  return (
    <div className="dropdown-content">
      {others.map((country) => {
        const { code, name } = country;
        return (
          <Button
            id={code}
            value={code}
            label={name}
            onClick={onClick}
            className="hiddenbtn"
          />
        );
      })}
    </div>
  );
};

const Radio = (props) => {
  const { id, name, value, onChange, label } = props;
  return (
    <div>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
      />
      <label for={label}>{label}</label>
    </div>
  );
};

const DateInfo = () => {
  const { month, day, dayInWeek, name } = useContext(DateContext);
  return (
    <div className="date-format">
      <div id={name} className="holiday-name">
        {name}
      </div>
      <div className="dayInWeek">{dayInWeek}</div>
      <div className="date">
        <div>{day}</div>
        <div className="month">{month}</div>
      </div>
    </div>
  );
};

const DateFrame = () => {
  return (
    <div className="frame">
      <DateInfo />
    </div>
  );
};

function toInteger(string) {
  return parseInt(string, 10);
}

function ParseDate(date) {
  const [year, month, day] = date.split("-");
  return { y: toInteger(year), m: toInteger(month), d: toInteger(day) };
}

const HolidayBoard = (props) => {
  const { holidays, year } = props;
  return (
    <div className="scrolling-wrapper">
      {holidays.map((holiday, index) => {
        const { name, date } = holiday;
        const { m, d } = ParseDate(date);
        // free account for API are limited to historical data only
        // hence, change year to current year
        const currentDate = new Date([year, m, d].join("-"));
        const dayInWeek = dayInWord[currentDate.getDay()];
        const month = monthInWord[m - 1];
        const day = d;
        const key = `${index}-${name}`;
        return (
          <DateContext.Provider value={{ month, day, dayInWeek, name }}>
            <DateFrame key={key} />
          </DateContext.Provider>
        );
      })}
      {Object.keys(holidays).length === 0 && (
        <div className="align-self-center">No holidays.</div>
      )}
    </div>
  );
};

function App(props) {
  const [country, setCountry] = useState("PH");
  const [dateToday, setDateToday] = useState("");
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(0);
  const [holidaysScope, setHolidaysScope] = useState("all");
  const [holidaysWithin, setHolidaysWithin] = useState("month");
  const [holidays, setHolidays] = useState([]);
  const [holidayToday, setHolidayToday] = useState([]);
  const [user, setUser] = useState("");

  const location = useLocation();
  useEffect(() => {
    try {
      setUser(location.state.username);
    } catch {}
  }, [location]);

  useEffect(() => {
    getDateToday();
    // set default settings of radio and button
    document.getElementById(holidaysScope).checked = true;
    document.getElementById(holidaysWithin).style.backgroundColor = `#4caf50`;
    document.getElementById(holidaysWithin).style.color = "white";
  }, []);

  useEffect(() => {
    if (day && month) getHolidays();
  }, [holidaysScope, holidaysWithin, dateToday]);

  useEffect(() => {
    if (day && month) getHolidayToday();
  }, [dateToday]);

  useEffect(() => {
    if (day && month) {
      getDateToday();
      getHolidays();
    }
  }, [country]);

  // fetch date today based on timezone
  const getDateToday = async () => {
    const timezone = countryInfo[country].capital;
    const response = await fetch(
      "https://worldtimeapi.org/api/timezone/" + timezone
    );
    const { datetime } = await response.json();
    const _date = datetime.split("T")[0];
    setDateToday(_date);
    const { y, m, d } = ParseDate(_date);
    setYear(y);
    setDay(d);
    setMonth(m);
  };

  // set color of tabs to default
  const resetTabLinkColor = (className) => {
    const tablinks = document.getElementsByClassName(className);
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].style.backgroundColor = "";
      tablinks[i].style.color = "black";
    }
  };

  const changeHolidaysWithin = (event) => {
    setHolidaysWithin(event.target.value);
    resetTabLinkColor(event.target.className);
    // set color of chosen tab
    document.getElementById(event.target.id).style.backgroundColor = `#4caf50`; //green
    document.getElementById(event.target.id).style.color = "white";
  };

  const changeScope = () => {
    const scope = document.querySelector('input[name="display-scope"]:checked')
      .value;
    setHolidaysScope(scope);
    return;
  };

  const changeCountry = (event) => {
    setCountry(event.target.value);
  };

  const getHolidays = async () => {
    let body = `country=${country}&year=2020&pretty&key=${holidayApiKey}`;
    if (holidaysWithin === "month") {
      body += `&month=${month}`;
    }
    if (holidaysScope === "upcoming") {
      if (holidaysWithin !== "month") {
        body += `&month=${month}`;
      }
      body += `&day=${day}&upcoming=true`;
    }
    console.log("HolidayApi body", body);
    const response = await fetch("https://holidayapi.com/v1/holidays", {
      body: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    });
    const holidaysResponse = await response.json();
    if (holidaysScope === "upcoming" && holidaysWithin === "month") {
      const _date = holidaysResponse.holidays[0].date;
      const { m } = ParseDate(_date);
      if (m !== month) {
        setHolidays([]);
        return;
      }
    }
    setHolidays(holidaysResponse.holidays);
    return;
  };

  const getHolidayToday = async () => {
    let body = `country=${country}&year=2020&month=${month}&day=${day}&pretty&key=${holidayApiKey}`;
    const response = await fetch("https://holidayapi.com/v1/holidays", {
      body: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    });
    const holidayResponse = await response.json();
    setHolidayToday(holidayResponse.holidays);
    return;
  };

  return (
    <div className="App">
      <div className="header">
        <Header
          user={user}
          holidayToday={holidayToday}
          history={props.history}
        />
      </div>
      <div className="body">
        <SettingsInfo
          user={user}
          date={dateToday}
          country={country}
          onClick={changeCountry}
        />
        <div className="holidays-area">
          <div className="display">
            <div className="radio-group">
              <Radio
                id="all"
                name="display-scope"
                value="all"
                onChange={changeScope}
                label="All"
              />
              <Radio
                id="upcoming"
                name="display-scope"
                value="upcoming"
                onChange={changeScope}
                label="Upcoming"
              />
            </div>
            <div className="tablink-group">
              <Button
                onClick={changeHolidaysWithin}
                id="month"
                value="month"
                label="This Month"
                className="tablink"
              />
              <Button
                onClick={changeHolidaysWithin}
                id="year"
                value="year"
                label="This Year"
                className="tablink"
              />
            </div>
            <HolidayBoard holidays={holidays} year={year} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
