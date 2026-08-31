// Dynamic command builder
document.addEventListener('DOMContentLoaded', function() {
  const typeButtons = document.querySelectorAll('.cmd-type-btn');
  const subchannelInput = document.getElementById('dynamic-subchannel');
  const labelInput = document.getElementById('dynamic-label');
  const planToggle = document.getElementById('plan-toggle');
  const planOptionsWrapper = document.getElementById('plan-options-wrapper');
  const planTypeSelect = document.getElementById('plan-type');
  const specificTimeInputsWrapper = document.getElementById('specific-time-inputs-wrapper');
  const relativeTimeInputsWrapper = document.getElementById('relative-time-inputs-wrapper');
  const planDate = document.getElementById('plan-date');
  const planTime = document.getElementById('plan-time');
  const relativeValue = document.getElementById('relative-time-value');
  const relativeUnit = document.getElementById('relative-time-unit');

  const lengthSelect = document.getElementById('length-select');
  const specificLengthInputsWrapper = document.getElementById('specific-length-inputs-wrapper');
  const approxMinutesInputsWrapper = document.getElementById('approx-minutes-inputs-wrapper');
  const approxDurationSelect = document.getElementById('approx-duration-select');
  const timeHours = document.getElementById('time-hours');
  const timeMinutes = document.getElementById('time-minutes');
  const timeSeconds = document.getElementById('time-seconds');
  const approxDays = document.getElementById('approx-days');
  const approxHours = document.getElementById('approx-hours');
  const approxMinutes = document.getElementById('approx-minutes');
  const dynamicCmdBox = document.getElementById('dynamic-cmd');

  function getActiveType() {
    const activeBtn = document.querySelector('.cmd-type-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-type') : 'video';
  }

  function formatSpecificLength() {
    const h = parseInt(timeHours.value) || 0;
    const m = parseInt(timeMinutes.value) || 0;
    const s = parseInt(timeSeconds.value) || 0;

    if (h === 0) {
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatApproxMinutes() {
    const d = parseInt(approxDays.value) || 0;
    const h = parseInt(approxHours.value) || 0;
    const m = parseInt(approxMinutes.value) || 0;

    const parts = [];
    if (d) parts.push(`${d} day${d === 1 ? '' : 's'}`);
    if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
    if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);

    return parts.length ? parts.join(' ') : '0 minutes';
  }

  function formatApproxDurationValue() {
    const selectedOption = approxDurationSelect ? approxDurationSelect.options[approxDurationSelect.selectedIndex] : null;
    if (!selectedOption) return 'Approximate Duration';
    return selectedOption.textContent.replace(/\s*\(.+?\)\s*$/, '').trim();
  }

  function formatLengthValue() {
    if (!lengthSelect || lengthSelect.value === 'none') return '';

    if (lengthSelect.value === 'specific') return formatSpecificLength();
    if (lengthSelect.value === 'approx-min') return formatApproxMinutes();
    if (lengthSelect.value === 'approx') return formatApproxDurationValue();
    return '';
  }

  function formatUnixTimestamp(dateString, timeString) {
    if (!dateString || !timeString) return '';
    const date = new Date(`${dateString}T${timeString}`);
    if (Number.isNaN(date.getTime())) return '';
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
  }

  function formatRelativeTime() {
    const value = Math.max(1, parseInt(relativeValue.value) || 1);
    const unit = relativeUnit.value;
    const labels = {
      minute: value === 1 ? 'minute' : 'minutes',
      hour: value === 1 ? 'hour' : 'hours',
      day: value === 1 ? 'day' : 'days'
    };
    return `in ${value} ${labels[unit]}`;
  }

  function buildPlanPart() {
    if (!planToggle || !planToggle.checked) return '';
    if (!planTypeSelect || planTypeSelect.value === 'none') return '';

    if (planTypeSelect.value === 'specific') {
      const specificValue = formatUnixTimestamp(planDate.value, planTime.value);
      return specificValue ? ` -p ${specificValue}` : '';
    }

    if (planTypeSelect.value === 'relative') {
      return ` -p ${formatRelativeTime()}`;
    }

    return '';
  }

  function syncShortRestrictions() {
    const isShort = getActiveType() === 'short';

    if (approxDays) {
      approxDays.disabled = isShort;
      approxDays.style.opacity = isShort ? '0.45' : '1';
      approxDays.style.cursor = isShort ? 'not-allowed' : 'text';
      if (isShort && approxDays.value !== '0') approxDays.value = '0';
    }

    if (approxMinutes) {
      approxMinutes.max = isShort ? '5' : '59';
      if (isShort && Number(approxMinutes.value) > 5) approxMinutes.value = '5';
    }

    if (approxDurationSelect) {
      const options = [...approxDurationSelect.options];
      options.forEach(option => {
        const shouldDisable = isShort && ['medium', 'long', 'xl', 'xxl', 'xxxl'].includes(option.value);
        option.disabled = shouldDisable;
        option.style.color = shouldDisable ? '#999' : '#111315';
      });

      if (isShort && ['medium', 'long', 'xl', 'xxl', 'xxxl'].includes(approxDurationSelect.value)) {
        approxDurationSelect.value = 'short';
      }
    }
  }

  function syncLengthVisibility() {
    if (!lengthSelect) return;

    if (specificLengthInputsWrapper) {
      specificLengthInputsWrapper.style.display = lengthSelect.value === 'specific' ? 'flex' : 'none';
    }

    if (approxMinutesInputsWrapper) {
      approxMinutesInputsWrapper.style.display = lengthSelect.value === 'approx-min' ? 'flex' : 'none';
    }

    if (approxDurationSelect) {
      approxDurationSelect.style.display = lengthSelect.value === 'approx' ? 'block' : 'none';
    }
  }

  function syncPlanControls() {
    if (!planToggle || !planOptionsWrapper || !planTypeSelect) return;
    const isEnabled = planToggle.checked;
    planOptionsWrapper.style.display = isEnabled ? 'block' : 'none';

    if (specificTimeInputsWrapper) {
      specificTimeInputsWrapper.style.display = isEnabled && planTypeSelect.value === 'specific' ? 'flex' : 'none';
    }

    if (relativeTimeInputsWrapper) {
      relativeTimeInputsWrapper.style.display = isEnabled && planTypeSelect.value === 'relative' ? 'flex' : 'none';
    }
  }

  function updateCommand() {
    const type = getActiveType();
    const subchannel = subchannelInput ? subchannelInput.value.trim() : '';
    const label = labelInput ? labelInput.value.trim() : '';
    const planPart = buildPlanPart();
    const lengthValue = formatLengthValue();

    let cmd = `!${type}${planPart}`;
    if (subchannel) cmd += ` (${subchannel})`;
    if (label) cmd += ` ${label}`;
    if (lengthValue) cmd += `\nLength: ${lengthValue}`;

    dynamicCmdBox.textContent = cmd;
  }

  if (typeButtons.length && dynamicCmdBox) {
    typeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        typeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        syncShortRestrictions();
        updateCommand();
      });
    });
  }

  if (subchannelInput) subchannelInput.addEventListener('input', updateCommand);
  if (labelInput) labelInput.addEventListener('input', updateCommand);

  if (planToggle) planToggle.addEventListener('change', function() { syncPlanControls(); updateCommand(); });
  if (planTypeSelect) planTypeSelect.addEventListener('change', function() { syncPlanControls(); updateCommand(); });
  if (planDate) planDate.addEventListener('input', updateCommand);
  if (planTime) planTime.addEventListener('input', updateCommand);
  if (relativeValue) relativeValue.addEventListener('input', updateCommand);
  if (relativeUnit) relativeUnit.addEventListener('change', updateCommand);

  if (lengthSelect) lengthSelect.addEventListener('change', function() { syncLengthVisibility(); updateCommand(); });
  if (approxDurationSelect) approxDurationSelect.addEventListener('change', updateCommand);
  if (timeHours) timeHours.addEventListener('input', updateCommand);
  if (timeMinutes) timeMinutes.addEventListener('input', updateCommand);
  if (timeSeconds) timeSeconds.addEventListener('input', updateCommand);
  if (approxDays) approxDays.addEventListener('input', updateCommand);
  if (approxHours) approxHours.addEventListener('input', updateCommand);
  if (approxMinutes) approxMinutes.addEventListener('input', updateCommand);

  syncShortRestrictions();
  syncLengthVisibility();
  syncPlanControls();
  updateCommand();
});

// Copy command functionality
document.addEventListener('DOMContentLoaded', function() {
  const copyButtons = document.querySelectorAll('.cmd-copy-btn');
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const wrapper = this.closest('.cmd-box-wrapper');
      const cmdBox = wrapper.querySelector('.cmd-box');
      const text = cmdBox.textContent;
      
      navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalText = this.textContent;
        this.classList.add('copied');
        this.textContent = 'Copied!';
        
        setTimeout(() => {
          this.classList.remove('copied');
          this.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  });
});

// Live command builder
document.addEventListener('DOMContentLoaded', function() {
  const liveSubchannelInput = document.getElementById('live-subchannel');
  const liveLabelInput = document.getElementById('live-label');
  const liveEndTimeType = document.getElementById('live-end-time-type');
  const liveSpecificTimeInputsWrapper = document.getElementById('live-specific-time-inputs-wrapper');
  const liveRelativeTimeInputsWrapper = document.getElementById('live-relative-time-inputs-wrapper');
  const liveCustomInputWrapper = document.getElementById('live-custom-input-wrapper');
  const liveEndDate = document.getElementById('live-end-date');
  const liveEndTime = document.getElementById('live-end-time');
  const liveRelativeValue = document.getElementById('live-relative-value');
  const liveRelativeUnit = document.getElementById('live-relative-unit');
  const liveCustomText = document.getElementById('live-custom-text');
  const liveCmdBox = document.getElementById('live-cmd');

  function formatUnixTimestamp(dateString, timeString) {
    if (!dateString || !timeString) return '';
    const date = new Date(`${dateString}T${timeString}`);
    if (Number.isNaN(date.getTime())) return '';
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
  }

  function formatRelativeTime() {
    const value = Math.max(1, parseInt(liveRelativeValue.value) || 1);
    const unit = liveRelativeUnit.value;
    const labels = {
      minute: value === 1 ? 'minute' : 'minutes',
      hour: value === 1 ? 'hour' : 'hours',
      day: value === 1 ? 'day' : 'days'
    };
    return `in ${value} ${labels[unit]}`;
  }

  function buildEndTimePart() {
    if (!liveEndTimeType || liveEndTimeType.value === 'none') return '';

    if (liveEndTimeType.value === 'specific') {
      const specificValue = formatUnixTimestamp(liveEndDate.value, liveEndTime.value);
      return specificValue ? `\nEnd at: ${specificValue}` : '';
    }

    if (liveEndTimeType.value === 'relative') {
      return `\nEnd at: ${formatRelativeTime()}`;
    }

    if (liveEndTimeType.value === 'custom') {
      const customValue = liveCustomText ? liveCustomText.value.trim() : '';
      return customValue ? `\nEnd at: ${customValue}` : '';
    }

    return '';
  }

  function syncEndTimeControls() {
    if (!liveEndTimeType) return;

    if (liveSpecificTimeInputsWrapper) {
      liveSpecificTimeInputsWrapper.style.display = liveEndTimeType.value === 'specific' ? 'flex' : 'none';
    }

    if (liveRelativeTimeInputsWrapper) {
      liveRelativeTimeInputsWrapper.style.display = liveEndTimeType.value === 'relative' ? 'flex' : 'none';
    }

    if (liveCustomInputWrapper) {
      liveCustomInputWrapper.style.display = liveEndTimeType.value === 'custom' ? 'flex' : 'none';
    }
  }

  function updateLiveCommand() {
    const subchannel = liveSubchannelInput ? liveSubchannelInput.value.trim() : '';
    const label = liveLabelInput ? liveLabelInput.value.trim() : '';
    const endTimePart = buildEndTimePart();

    let cmd = '!live';
    if (subchannel) {
      cmd += ` (${subchannel})`;
    }
    if (label) {
      cmd += ` ${label}`;
    }
    cmd += endTimePart;

    liveCmdBox.textContent = cmd;
  }

  if (liveSubchannelInput) {
    liveSubchannelInput.addEventListener('input', updateLiveCommand);
  }

  if (liveLabelInput) {
    liveLabelInput.addEventListener('input', updateLiveCommand);
  }

  if (liveEndTimeType) {
    liveEndTimeType.addEventListener('change', function() {
      syncEndTimeControls();
      updateLiveCommand();
    });
  }

  if (liveEndDate) {
    liveEndDate.addEventListener('input', updateLiveCommand);
  }

  if (liveEndTime) {
    liveEndTime.addEventListener('input', updateLiveCommand);
  }

  if (liveRelativeValue) {
    liveRelativeValue.addEventListener('input', updateLiveCommand);
  }

  if (liveRelativeUnit) {
    liveRelativeUnit.addEventListener('change', updateLiveCommand);
  }

  if (liveCustomText) {
    liveCustomText.addEventListener('input', updateLiveCommand);
  }

  syncEndTimeControls();
  updateLiveCommand();
});
