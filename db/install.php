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

defined('MOODLE_INTERNAL') || die();

/**
 * Mynotes block installation.
 *
 * @package    block_mynotes
 */

function xmldb_block_mynotes_install() {
    global $DB;

    $obj = new stdClass();
    $obj->blockname = 'mynotes';
    $obj->parentcontextid = SITEID;
    $obj->showinsubcontexts = 1;
    $obj->pagetypepattern = '*';
    $obj->defaultweight = 0;
    $obj->defaultregion = BLOCK_POS_LEFT;
    $obj->configdata = '';
    $obj->timecreated = time();
    $obj->timemodified = time();
    $DB->insert_record('block_instances', $obj);

}