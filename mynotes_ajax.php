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

/*
 * Handling all ajax request for mynotes API
 *
 * @package    block_mynotes
 * @author     Gautam Kumar Das<gautam.arg@gmail.com>
 */
define('AJAX_SCRIPT', true);
define('NO_DEBUG_DISPLAY', true);

require_once('../../config.php');
require_once($CFG->dirroot.'/course/lib.php');
require_once($CFG->dirroot . '/blocks/mynotes/lib.php');

$contextid = optional_param('contextid', SYSCONTEXTID, PARAM_INT);
$contextarea = optional_param('contextarea', 'site', PARAM_ALPHA);
$action    = optional_param('action', '', PARAM_ALPHA);
$page      = optional_param('page', 0, PARAM_INT);

list($context, $course, $cm) = get_context_info_array($contextid);

if ( $contextid == SYSCONTEXTID || $context->contextlevel == CONTEXT_USER) {
    $course = get_site();
}

$PAGE->set_url('/blocks/mynotes/mynotes_ajax.php');

require_course_login($course, true, $cm);

$PAGE->set_context($context);
if (!empty($cm)) {
    $PAGE->set_cm($cm, $course);
} else if (!empty($course)) {
    $PAGE->set_course($course);
}

if (!confirm_sesskey()) {
    $error = array('error' => get_string('invalidsesskey', 'error'));
    die(json_encode($error));
}
 
if (!isloggedin()) {
    echo json_encode(array('error' => 'require_login'));
    die();
}
$config = get_config('block_mynotes');

echo $OUTPUT->header(); //...send headers
// process ajax request
switch ($action) {
    case 'add':
        $content   = optional_param('content',   '', PARAM_RAW);
        $manager = new block_mynotes_manager();
        if ($note = $manager->addmynote($context, $contextarea, $course, $content)) {
            $options = new stdClass();
            $options->page = $page;        
            $options->courseid = $course->id;
            $options->contextid   = $context->id;
            $options->context   = $context;
            $options->contextarea = $contextarea;
            unset($options->courseid);
            $count = $manager->count_mynotes($options);
            echo json_encode(array('notes' => array($note), 'count' => $count));
        } else {
            echo json_encode(array('error' => 'Unable to add note'));
        }
        die();
        break;
    case 'get':
        $manager = new block_mynotes_manager();
        $options = new stdClass();
        $options->page = $page;
        $options->contextarea = $contextarea;
        $count = $manager->count_mynotes($options);
        $notes = $manager->get_mynotes($options);
        echo json_encode(array('notes' => $notes, 'count' => $count));
        die();
        break;
    case 'delete':
        $noteid = required_param('noteid', PARAM_INT);
        $limitfrom = optional_param('lastnotecounts', 0, PARAM_INT);
        $manager = new block_mynotes_manager();
        if ($manager->delete($noteid)) {
            $options = new stdClass();   
            $options->page = $page;
            $options->contextarea = $contextarea;
            $count = $manager->count_mynotes($options);
            if ($limitfrom) {
                $options->limitfrom = $limitfrom - 1;
            }
            $notes = $manager->get_mynotes($options);
            echo json_encode(array('notes' => $notes, 'count' => $count, 'noteid' => $noteid));
        }
        die();
        break;
}
die();