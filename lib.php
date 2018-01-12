<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * The mynotes block helper functions and callbacks
 *
 * @package    block_mynotes
 * @author     Gautam Kumar Das<gautam.arg@gmail.com>
 */

defined('MOODLE_INTERNAL') || die();


class block_mynotes_manager  {

    public $perpage = 5;
    private $config = null;

    /*
     * Constructor.
     */
    public function __construct() {
        $this->config = get_config('block_mynotes');
        $this->perpage = $this->config->mynotesperpage;
    }

    /**
     * Returns matched mynotes
     *
     * @param  int $page
     * @return array
     */
    public function get_mynotes($options) {
        global $DB, $CFG, $USER, $OUTPUT;

        $page = (!isset($options->page) || !$options->page) ? 0 : $options->page;
        $perpage = $this->perpage;

        $params = array();
        $start = $page * $perpage;
        $ufields = 'u.id';

        $where = ' m.userid = :userid';
        $params['userid'] = $USER->id;
        if (isset($options->contextarea) && !empty($options->contextarea)) {
            $where .= ' AND m.contextarea = :contextarea';
            $params['contextarea'] = $options->contextarea;
        }
        if (isset($options->courseid) && $options->courseid) {
            $where .= ' AND m.courseid = :courseid';
            $params['courseid'] = $options->courseid;            
        }
        $sql = "SELECT $ufields, 
            m.id AS mynoteid, m.content AS ccontent, m.contextarea, m.format AS cformat, 
            m.timecreated AS timecreated, c.fullname as coursename, m.courseid
                  FROM {block_mynotes} m
                  JOIN {user} u ON u.id = m.userid
                  LEFT JOIN {course} c ON c.id = m.courseid
                 WHERE $where
              ORDER BY m.timecreated DESC"; 
        $strftime = get_string('strftimerecentfull', 'langconfig');
        $mynotes = array();
        $formatoptions = array('overflowdiv' => true);
        $start = (isset($options->limitfrom)) ? $options->limitfrom : $start;
        $rs = $DB->get_recordset_sql($sql, $params, $start, $perpage);
        foreach ($rs as $u) {
            $c = new stdClass();
            $c->id = $u->mynoteid;
            $c->userid = $u->id;
            if ($u->courseid != SITEID) {
                $c->coursename = html_writer::link(course_get_url($u->courseid), $u->coursename);
            } else {
                $c->coursename = '';
            }
            $c->content = $u->ccontent;
            $c->contextarea = $u->contextarea;
            $c->format = $u->cformat;
            $c->timecreated = userdate($u->timecreated, $strftime);
            $c->content = format_text($c->content, $c->format, $formatoptions);
            $c->delete = true;
            $mynotes[] = $c;
        }
        $rs->close();
        return $mynotes;
    }
    
    /**
     * Returns count of the mynotes in a table where all the given conditions met.
     *
     * @param object $options
     * @return int The count of records
     */
    public function count_mynotes($options) {
        global $DB, $USER;
        $params = array();
        $params['userid'] = $USER->id;
        if (isset($options->contextarea) && !empty($options->contextarea)) {
            $params['contextarea'] = $options->contextarea;
        }
        if (isset($options->courseid) && !empty($options->courseid)) {
            $params['courseid'] = $options->courseid;
        }
        return $DB->count_records('block_mynotes', $params);
    }

    /*
     * Returns paging bar for mynotes
     * 
     * @param object $options must contain properties(contextid, count, page, perpage)
     * @return html
     */
    public function get_pagination($options) {
        global $OUTPUT;
        $baseurl = new moodle_url('/blocks/mynotes/mynotes_ajax.php', 
                array(
                    'contextid' => $options->contextid)
                );
        return $OUTPUT->paging_bar($options->count, $options->page, $this->perpage, $baseurl);
    }

    /*
     * Adding new record of mynote.
     * 
     * @return object of single mynote record if insert to DB else false
     */
    public function addmynote($context, $contextarea, $course, $content, $format = FORMAT_MOODLE) {
        global $CFG, $DB, $USER, $OUTPUT;
        
        $newnote = new stdClass;
        $newnote->contextid = $context->id;
        $newnote->contextarea = $contextarea;
        $newnote->content = $content;
        $newnote->courseid = $course->id;
        $newnote->format = $format;
        $newnote->userid = $USER->id;
        $newnote->timecreated = time();

        if ($cmtid = $DB->insert_record('block_mynotes', $newnote)) {
            $newnote->id = $cmtid;
            $newnote->content = format_text($newnote->content, $newnote->format, array('overflowdiv' => true));
            $newnote->timecreated = userdate($newnote->timecreated, get_string('strftimerecentfull', 'langconfig'));
            $newnote->coursename = ($newnote->courseid == SITEID) ? '' : $course->fullname;
            if (!empty($newnote->coursename)) {
                $newnote->coursename = html_writer::link(course_get_url($course), $newnote->coursename);
            }
            return $newnote;
        } else {
            return false;
        }
    }

    /*
     * Find all available context areas which is used to store and retrieve mynotes.
     * 
     * @return array
     */
    public function get_available_contextareas() {
        return array(
            'site' => get_string('site', 'block_mynotes'),
            'course' => get_string('course', 'block_mynotes'),
            'mod' => get_string('mod', 'block_mynotes'),
            'user' => get_string('user', 'block_mynotes'),
        );
    }
    /*
     * Find context area using context level.
     * 
     * @param object $context
     * @retrun string
     */
    public function get_current_tab($context, $page) {

        if ($page->url->compare(new moodle_url('/user/view.php'), URL_MATCH_BASE)) {
            return 'user';

        } else if ($page->url->compare(new moodle_url('/user/profile.php'), URL_MATCH_BASE)) {
            return 'user';

        } else if ($context->contextlevel == CONTEXT_SYSTEM) {
            return 'site';

        } else if ($context->contextlevel == CONTEXT_COURSE) {
            if ($context->instanceid == SITEID) {
                return 'site';
            }
            return 'course';

        } else if ($context->contextlevel == CONTEXT_MODULE) {
            return 'mod';

        } else if ($context->contextlevel == CONTEXT_USER) {
            return 'user';

        } else if ($context->contextlevel == CONTEXT_BLOCK) {
            $parent = $context->get_parent_context();

            if ($parent->contextlevel == CONTEXT_COURSE) {
                return 'course';
            } else if ($parent->contextlevel == CONTEXT_MODULE) {
                return 'mod';
            }
        }
    }

    /**
     * Delete a note
     *
     * @param  int $mynoteid
     * @return bool
     */
    public function delete($mynoteid) {
        global $DB, $USER;
        if (!$mynote = $DB->get_record('block_mynotes', array('id' => $mynoteid))) {
            throw new mynotes_exception('deletefailed', 'block_mynotes');
        }
        if ($USER->id != $mynote->userid) {
            throw new mynotes_exception('nopermissiontodelete', 'block_mynotes');
        }
        return $DB->delete_records('block_mynotes', array('id' => $mynoteid));
    }
}

/**
 * Mynotes exception class
 */
class mynotes_exception extends moodle_exception {
}