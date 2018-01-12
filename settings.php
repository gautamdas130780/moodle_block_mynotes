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
 * Settings for the Mynotes block
 *
 * @package    block_mynotes
 * @author     Gautam Kumar Das<gautam.arg@gmail.com>
 */

defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {

    $perpageoptions = array();
    for ($i = 1; $i < 20; $i++) {
        $perpageoptions[$i] = $i;
    }
    $settings->add(new admin_setting_configselect('block_mynotes/mynotesperpage', get_string('mynotesperpage', 'block_mynotes'),
                       get_string('mynotesperpage_help', 'block_mynotes'), 5, $perpageoptions));

    $settings->add(new admin_setting_configtext('block_mynotes/characterlimit', get_string('characterlimit', 'block_mynotes'),
                       get_string('characterlimit_help', 'block_mynotes'), 180, PARAM_INT, 3));

    $positionoptions = array();
    $positionoptions['mynotes-pos-rb'] = get_string('bottomright', 'block_mynotes');
    $positionoptions['mynotes-pos-lb'] = get_string('bottomleft', 'block_mynotes');
    $positionoptions['mynotes-pos-rt'] = get_string('topright', 'block_mynotes');
    $positionoptions['mynotes-pos-lt'] = get_string('topleft', 'block_mynotes');
    $settings->add(new admin_setting_configselect('block_mynotes/icondisplayposition', get_string('icondisplayposition', 'block_mynotes'),
                       get_string('icondisplayposition_help', 'block_mynotes'), 'mynotes-pos-rb', $positionoptions));
}