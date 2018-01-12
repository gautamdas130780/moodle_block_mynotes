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
 * The mynotes block
 *
 * @package    block_mynotes
 * @author     Gautam Kumar Das<gautam.arg@gmail.com>
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/blocks/mynotes/lib.php');

/**
 * Mynotes block.
 *
 * @package    block_mynotes
 * 
 */
class block_mynotes extends block_base {

    public function init() {
        $this->title = get_string('pluginname', 'block_mynotes');
    }

    public function has_config() {
        return true;
    }

    public function applicable_formats() {
        return array('all' => true);
    }

    public function instance_allow_multiple() {
        return false;
    }

    public function hide_header() {
        global $PAGE;
        if (!$PAGE->user_is_editing()) {
            return true;
        }
    }

    /**
     * The content object.
     *
     * @return stdObject
     */
    public function get_content() {
        global $CFG, $PAGE;
        
        static $jscount = 0;
        if ($this->content !== null) {
            return $this->content;
        }

        if (!isloggedin() or isguestuser()) {
            return '';      // Never useful unless you are logged in as real users
        }
        
        if (!in_array($PAGE->context->contextlevel, array(CONTEXT_COURSE, CONTEXT_SYSTEM, CONTEXT_MODULE, CONTEXT_USER))) {
            return '';
        }
        
        $this->content = new stdClass();
        $this->content->footer = '';
        $this->content->text = '';
        if (empty($this->instance)) {
            return $this->content;
        }        
        
        $this->content = new stdClass();
        $this->content->text = '';
        if ($PAGE->user_is_editing()) {
            $this->content->text = '<div class="inline-mynotes-opener">'.get_string('showmynotes', 'block_mynotes').'</div>';
        }
        $this->content->footer = '';
        
        if ($jscount == 0) {
            $this->block_mynotes_get_required_javascript();
            $jscount++;
        }
        return $this->content;
    }

    /*
     * load JS that requires into the page.
     */
    private function block_mynotes_get_required_javascript() {
        global $PAGE, $CFG; 
        list($context, $course, $cm) = get_context_info_array($PAGE->context->id);
        $config = get_config('block_mynotes');
        
        $mm = new block_mynotes_manager();
        $currenttabindex = $mm->get_current_tab($context, $PAGE);
        $arguments = array( 'arg'=> array(
            'instanceid' => $this->instance->id,
            'editing' => ($PAGE->user_is_editing()),
            'editingicon_pos' => ($PAGE->user_is_editing()) ? 'mynotes-pos-inline' : $config->icondisplayposition,
            'maxallowedcharacters' => $config->characterlimit,
            'contextid' => $context->id,
            'maxallowedcharacters_warning' => get_string('notmorethan', 'block_mynotes', $config->characterlimit),
            'contextareas' => $mm->get_available_contextareas(),
            'currenttabindex' => ($currenttabindex == null ? 'site' : $currenttabindex),
            'perpage' => $config->mynotesperpage,
            ),
        );
        $PAGE->requires->string_for_js('charactersleft', 'block_mynotes');
        $PAGE->requires->string_for_js('notmorethan', 'block_mynotes');
        $PAGE->requires->string_for_js('mynotes', 'block_mynotes');
        $PAGE->requires->string_for_js('showmynotes', 'block_mynotes');
        $PAGE->requires->string_for_js('savedsuccess', 'block_mynotes');
        $PAGE->requires->string_for_js('save', 'block_mynotes');
        $PAGE->requires->string_for_js('placeholdercontent', 'block_mynotes');
        $PAGE->requires->string_for_js('deletemynotes', 'block_mynotes');
        $PAGE->requires->string_for_js('mynotescount', 'block_mynotes');
        $PAGE->requires->string_for_js('previouspage', 'block_mynotes');
        $PAGE->requires->string_for_js('nextpage', 'block_mynotes');
        $PAGE->requires->string_for_js('nothingtodisplay', 'block_mynotes');
        $PAGE->requires->string_for_js('mynotessavedundertab', 'block_mynotes');
        $PAGE->requires->string_for_js('cancel', 'moodle');
        $this->page->requires->js_call_amd('block_mynotes/mynotesblock', 'init', $arguments);
    }
}