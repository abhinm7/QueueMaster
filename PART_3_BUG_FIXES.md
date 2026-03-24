# Part 3: Code Review & Bug Fixes

### Bug 1: Unhandled Promise (Server Crash)
**Explanation:** `taskRepository.find()` returns a pending Promise instead of an array, which causes a fatal crash when `.filter()` is called on it later.<br>
**Solution:** Add the `await` keyword to properly resolve the database query before processing the array.
```typescript
const tasks = await this.taskRepository.find({ // add await
  where: {
    user: { id: userId },
    createdAt: Between(new Date(startDate), new Date(endDate)),
  },
  relations: ['user'],
});
```

---

### Bug 2: Null Pointer Exception (Server Crash)
**Explanation:** `retryTask` attempts to modify `task.status` without checking if the task exists, throwing a fatal type error if an invalid ID is provided.<br>
**Solution:** Implement a null-check guard clause to safely return a 404 Not Found before any mutations occur.
```typescript
const task = await this.taskRepository.findOne({ where: { id: taskId } });

if (!task) throw new NotFoundException('Task not found'); // add task null check

task.status = 'PENDING';
```

---

### Bug 3: Post-Increment Overwrite (Logic Failure)
**Explanation:** `task.attempts = task.attempts++` returns the original value before incrementing, instantly overwriting the new value with the old one.<br>
**Solution:** Use compound assignment (`+= 1`) to correctly increment the property.
```typescript
task.attempts += 1; // fix increment operator
```

---

### Bug 4: Insecure Direct Object Reference (Critical Security Issue)
*Note: This does not cause a runtime crash, but it is a critical security vulnerability.*

**Explanation:** The `deleteTask` method accepts a `userId` parameter but completely ignores it in the database query, allowing any user to delete anyone else's tasks just by passing a valid task ID.<br>
**Solution:** Enforce data ownership by explicitly adding the `userId` constraint to the `where` clause.
```typescript
async deleteTask(taskId: string, userId: string) {
  const task = await this.taskRepository.findOne({
    where: { 
      id: taskId, 
      user: { id: userId } // add user id
    }, 
  });

  if (!task) throw new NotFoundException('Task not found or unauthorized');

  await this.taskRepository.delete(taskId);
  return { message: 'Task deleted' };
}
```