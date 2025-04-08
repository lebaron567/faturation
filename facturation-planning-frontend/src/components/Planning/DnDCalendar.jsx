// src/components/Planning/DnDCalendar.jsx
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "moment/locale/fr";

// CSS essentiels (ne pas oublier ceux du drag)
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

moment.locale("fr");

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export { DnDCalendar, localizer };
